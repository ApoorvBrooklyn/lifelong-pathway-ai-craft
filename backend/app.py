from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
from werkzeug.utils import secure_filename
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import PyPDF2
import docx
import spacy
import re
from groq import Groq
import json
from typing import Dict, List, Any
import logging
import asyncio
from datetime import datetime

# Local imports
from resource_scraper import get_resources_for_skills

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


# Configure Groq client
GROQ_API_KEY = "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"
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is not set")

# Update to use the latest Llama 4 model
GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"  # Latest Llama 4 model

try:
    groq_client = Groq(api_key=GROQ_API_KEY)
    # Test the client with a simple request
    test_completion = groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": "test"}],
        max_tokens=10
    )
    logger.info(f"Successfully initialized Groq client with model {GROQ_MODEL}")
except Exception as e:
    logger.error(f"Failed to initialize Groq client: {str(e)}")
    raise

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit file size to 16MB

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Create data directory for storing roadmaps
DATA_FOLDER = 'data'
os.makedirs(DATA_FOLDER, exist_ok=True)

# Load spaCy model for NLP processing
try:
    nlp = spacy.load("en_core_web_sm")
except:
    # If model not available, download it
    import subprocess
    subprocess.call(['python', '-m', 'spacy', 'download', 'en_core_web_sm'])
    nlp = spacy.load("en_core_web_sm")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(pdf_path):
    """Extract text content from PDF files"""
    text = ""
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
    return text

def extract_text_from_docx(docx_path):
    """Extract text content from DOCX files"""
    doc = docx.Document(docx_path)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

def extract_text_from_file(file_path):
    """Extract text based on file extension"""
    if file_path.endswith('.pdf'):
        return extract_text_from_pdf(file_path)
    elif file_path.endswith('.docx'):
        return extract_text_from_docx(file_path)
    elif file_path.endswith('.txt'):
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
            return file.read()
    return ""

def extract_skills_from_text(text):
    """Extract skills from text using Groq for dynamic skill identification"""
    try:
        logger.debug(f"Starting skill extraction for text of length: {len(text)}")
        prompt = f"""Analyze the following text and extract all relevant technical and soft skills. Include both conventional and non-conventional skills that would be valuable in a professional context.

Text to analyze:
{text}

Please provide a JSON response with the following structure:
{{
    "technical_skills": [],
    "soft_skills": [],
    "domain_specific_skills": [],
    "tools_and_technologies": []
}}

For each skill, include a confidence score (0-1) indicating how certain you are that this is a relevant skill.
Example format:
{{
    "technical_skills": [
        {{"skill": "python", "confidence": 0.95}},
        {{"skill": "machine learning", "confidence": 0.85}}
    ],
    "soft_skills": [
        {{"skill": "project management", "confidence": 0.9}},
        {{"skill": "cross-functional collaboration", "confidence": 0.8}}
    ],
    "domain_specific_skills": [
        {{"skill": "financial modeling", "confidence": 0.85}},
        {{"skill": "regulatory compliance", "confidence": 0.75}}
    ],
    "tools_and_technologies": [
        {{"skill": "git", "confidence": 0.9}},
        {{"skill": "docker", "confidence": 0.85}}
    ]
}}"""

        logger.debug("Sending request to Groq API")
        completion = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert at identifying professional skills from text, including both conventional and non-conventional skills."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000,
            top_p=1,
            stream=False
        )
        
        logger.debug("Received response from Groq API")
        response_text = completion.choices[0].message.content
        logger.debug(f"Raw response: {response_text[:200]}...")  # Log first 200 chars of response
        
        try:
            skills_analysis = json.loads(response_text)
            logger.debug(f"Successfully parsed JSON response with {len(skills_analysis)} categories")
            
            # Combine all skills into a single list with their confidence scores
            all_skills = []
            for category in skills_analysis.values():
                if isinstance(category, list):
                    for skill_item in category:
                        if isinstance(skill_item, dict) and 'skill' in skill_item:
                            all_skills.append({
                                'skill': skill_item['skill'].lower(),
                                'confidence': skill_item.get('confidence', 0.5)
                            })
            
            # Sort skills by confidence score
            all_skills.sort(key=lambda x: x['confidence'], reverse=True)
            
            # Return only skills with confidence above threshold
            filtered_skills = [skill['skill'] for skill in all_skills if skill['confidence'] >= 0.6]
            logger.debug(f"Extracted {len(filtered_skills)} skills with confidence >= 0.6")
            return filtered_skills
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {str(e)}")
            logger.error(f"Raw response that failed to parse: {response_text}")
            # Fall back to basic NLP extraction
            return fallback_skill_extraction(text)
            
    except Exception as e:
        logger.error(f"Error in extract_skills_from_text: {str(e)}")
        return fallback_skill_extraction(text)

def fallback_skill_extraction(text):
    """Fallback method for skill extraction using basic NLP"""
    logger.info("Using fallback NLP-based skill extraction")
    doc = nlp(text.lower())
    skills = []
    for chunk in doc.noun_chunks:
        if len(chunk.text.split()) <= 3:
            skills.append(chunk.text.lower())
    for ent in doc.ents:
        if ent.label_ in ['ORG', 'PRODUCT']:
            skills.append(ent.text.lower())
    return list(set(skills))

def analyze_resume(file_path):
    """Analyze resume text to extract relevant information"""
    text = extract_text_from_file(file_path)
    skills = extract_skills_from_text(text)
    
    # Get detailed skill analysis from Groq
    prompt = f"""Analyze the following skills extracted from a resume and provide a comprehensive assessment:

Skills: {', '.join(skills)}

Please provide a JSON response with the following structure:
{{
    "skill_categories": {{
        "technical": [],
        "soft": [],
        "domain": [],
        "tools": []
    }},
    "skill_scores": {{
        "technical_score": 0,
        "communication_score": 0,
        "leadership_score": 0,
        "problem_solving_score": 0,
        "creativity_score": 0
    }},
    "skill_levels": {{
        "beginner": [],
        "intermediate": [],
        "advanced": []
    }}
}}"""

    try:
        completion = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert at analyzing professional skills and providing detailed assessments."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000,
            top_p=1,
            stream=False
        )
        
        # Parse the response
        response_text = completion.choices[0].message.content
        try:
            analysis = json.loads(response_text)
            return {
                'skills': skills,
                'skill_categories': analysis.get('skill_categories', {}),
                'skill_scores': analysis.get('skill_scores', {}),
                'skill_levels': analysis.get('skill_levels', {})
            }
        except json.JSONDecodeError:
            # Fallback to basic scoring if JSON parsing fails
            return {
                'skills': skills,
                'technical_score': 70,
                'communication_score': 60,
                'leadership_score': 50,
                'problem_solving_score': 75,
                'creativity_score': 65
            }
            
    except Exception as e:
        # Fallback to basic scoring if Groq API fails
        return {
            'skills': skills,
            'technical_score': 70,
            'communication_score': 60,
            'leadership_score': 50,
            'problem_solving_score': 75,
            'creativity_score': 65
        }

def analyze_career_gap_with_groq(
    current_skills: List[str],
    target_role: str,
    job_description: str,
    experience: str,
    timeframe: str,
    interests: str,
    learning_style: str,
    time_commitment: str,
    budget: str
) -> Dict[str, Any]:
    """
    Analyze career gap using Groq API to provide intelligent recommendations.
    """
    try:
        prompt = f"""As a career development expert, analyze the following information and provide detailed recommendations:

Current Skills: {', '.join(current_skills)}
Target Role: {target_role}
Job Description: {job_description}
Experience Level: {experience}
Target Timeframe: {timeframe}
Interests: {interests}
Learning Style: {learning_style}
Time Commitment: {time_commitment}
Budget: {budget}

Please provide a structured analysis including:
1. Required skills for the target role
2. Skill gaps analysis with current and target scores
3. Learning path recommendations with clear phases and milestones
4. Timeline-based milestones
5. Resource recommendations based on learning style and budget
6. Risk assessment and mitigation strategies

Format the response as a JSON object with the following structure:
{{
    "required_skills": [
        {{
            "skill": "skill name",
            "importance": "high/medium/low",
            "description": "brief description"
        }}
    ],
    "skill_gaps": [
        {{
            "skill": "skill name",
            "current_score": 0-100,
            "target_score": 0-100,
            "gap": "description of the gap",
            "priority": "high/medium/low"
        }}
    ],
    "learning_path": [
        {{
            "phase": "phase number",
            "title": "phase title",
            "description": "phase description",
            "duration": "estimated duration",
            "skills_to_develop": ["skill1", "skill2"],
            "resources": ["resource1", "resource2"]
        }}
    ],
    "milestones": [
        {{
            "milestone": "milestone name",
            "description": "milestone description",
            "target_date": "YYYY-MM-DD",
            "dependencies": ["dependency1", "dependency2"]
        }}
    ],
    "resources": [
        {{
            "title": "resource title",
            "type": "course/video/book",
            "url": "resource url",
            "description": "resource description",
            "difficulty": "beginner/intermediate/advanced",
            "estimated_time": "estimated completion time"
        }}
    ],
    "risk_assessment": [
        {{
            "risk": "risk description",
            "impact": "high/medium/low",
            "probability": "high/medium/low",
            "mitigation": "mitigation strategy"
        }}
    ]
}}

IMPORTANT: 
1. Return ONLY the JSON object without any additional text, markdown formatting, or explanations.
2. Always include current_score and target_score for each skill gap.
3. Ensure learning_path has at least 3 phases with clear progression.
4. Include at least 5 resources per skill gap.
5. All scores should be between 0-100."""

        logger.debug("Sending request to Groq API")
        completion = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are a career development expert specializing in technical roles and skill gap analysis. Always respond with valid JSON only, without any additional text or formatting. Ensure all required fields are present and properly formatted."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=4000,
            top_p=1,
            stream=False
        )
        
        # Parse the response
        response_text = completion.choices[0].message.content.strip()
        logger.debug(f"Raw response from Groq: {response_text[:200]}...")
        
        try:
            # Clean the response text to ensure it's valid JSON
            response_text = response_text.replace('```json', '').replace('```', '').strip()
            
            # Parse the JSON
            analysis = json.loads(response_text)
            
            # Validate required fields
            required_fields = ['required_skills', 'skill_gaps', 'learning_path', 'milestones', 'resources', 'risk_assessment']
            for field in required_fields:
                if field not in analysis or not analysis[field]:
                    logger.error(f"Missing or empty required field: {field}")
                    # Add default values for missing fields
                    if field == 'skill_gaps':
                        analysis[field] = [{
                            'skill': skill,
                            'current_score': 0,
                            'target_score': 100,
                            'gap': f"Need to develop {skill}",
                            'priority': 'high'
                        } for skill in current_skills]
                    elif field == 'learning_path':
                        analysis[field] = [{
                            'phase': '1',
                            'title': 'Foundation',
                            'description': 'Build fundamental skills',
                            'duration': '3 months',
                            'skills_to_develop': current_skills,
                            'resources': []
                        }]
                    elif field == 'resources':
                        analysis[field] = [{
                            'title': f'Introduction to {skill}',
                            'type': 'course',
                            'url': f'https://example.com/{skill}',
                            'description': f'Learn the basics of {skill}',
                            'difficulty': 'beginner',
                            'estimated_time': '2 weeks'
                        } for skill in current_skills]
            
            # Add a summary section for frontend display
            analysis['summary'] = {
                'title': f'Career Path Analysis for {target_role}',
                'overview': f'Based on your current skills and the target role of {target_role}, here\'s a comprehensive analysis of your career path.',
                'key_findings': [
                    f'Found {len(analysis.get("required_skills", []))} key skills required for the role',
                    f'Identified {len(analysis.get("skill_gaps", []))} skill gaps to address',
                    f'Created a {len(analysis.get("learning_path", []))}-phase learning path',
                    f'Set {len(analysis.get("milestones", []))} key milestones',
                    f'Recommended {len(analysis.get("resources", []))} learning resources',
                    f'Identified {len(analysis.get("risk_assessment", []))} potential risks and mitigation strategies'
                ]
            }
            
            logger.debug("Successfully parsed and enhanced JSON response")
            return analysis
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {str(e)}")
            logger.error(f"Raw response that failed to parse: {response_text}")
            # Return a default response with basic structure
            return {
                "required_skills": [{"skill": skill, "importance": "high", "description": f"Required for {target_role}"} for skill in current_skills],
                "skill_gaps": [{"skill": skill, "current_score": 0, "target_score": 100, "gap": f"Need to develop {skill}", "priority": "high"} for skill in current_skills],
                "learning_path": [{"phase": "1", "title": "Foundation", "description": "Build fundamental skills", "duration": "3 months", "skills_to_develop": current_skills, "resources": []}],
                "milestones": [{"milestone": f"Learn {skill}", "description": f"Master {skill}", "target_date": "2024-12-31", "dependencies": []} for skill in current_skills],
                "resources": [{"title": f"Introduction to {skill}", "type": "course", "url": f"https://example.com/{skill}", "description": f"Learn the basics of {skill}", "difficulty": "beginner", "estimated_time": "2 weeks"} for skill in current_skills],
                "risk_assessment": [{"risk": "Skill gap", "impact": "high", "probability": "high", "mitigation": "Regular practice and learning"}],
                "summary": {
                    "title": f"Career Path Analysis for {target_role}",
                    "overview": f"Basic analysis for {target_role} role",
                    "key_findings": ["Basic skill analysis", "Learning path created", "Resources recommended"]
                }
            }
            
    except Exception as e:
        logger.error(f"Error calling Groq API: {str(e)}", exc_info=True)
        return {
            "error": f"Error calling Groq API: {str(e)}"
        }

@app.route('/api/upload-resume', methods=['POST'])
def upload_resume():
    """Endpoint to upload and process a resume"""
    try:
        if 'file' not in request.files:
            logger.error("No file part in request")
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            logger.error("No selected file")
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            # Generate unique filename
            filename = secure_filename(file.filename)
            unique_filename = f"{str(uuid.uuid4())}_{filename}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            
            # Save the uploaded file
            file.save(file_path)
            logger.info(f"Saved file to {file_path}")
            
            try:
                # Analyze the resume
                analysis_results = analyze_resume(file_path)
                logger.info("Successfully analyzed resume")
                
                # Return analysis results
                return jsonify({
                    'message': 'Resume uploaded and analyzed successfully',
                    'analysis': analysis_results
                })
            except Exception as e:
                logger.error(f"Error analyzing resume: {str(e)}")
                return jsonify({'error': f'Error analyzing resume: {str(e)}'}), 500
            finally:
                # Clean up the uploaded file
                try:
                    os.remove(file_path)
                    logger.info(f"Cleaned up file: {file_path}")
                except Exception as e:
                    logger.error(f"Error cleaning up file {file_path}: {str(e)}")
        
        logger.error(f"File type not allowed: {file.filename}")
        return jsonify({'error': 'File type not allowed'}), 400
        
    except Exception as e:
        logger.error(f"Unexpected error in upload_resume: {str(e)}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@app.route('/api/assess-skills', methods=['POST'])
def assess_skills():
    """Endpoint to process skill assessment data using Groq-based analysis"""
    try:
        data = request.json
        logger.debug(f"Received request data: {data}")
        
        if not data:
            logger.error("No data provided in request")
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract relevant information from request
        current_role = data.get('currentRole', '')
        experience = data.get('experience', '')
        technical_skills = data.get('technicalSkills', '')
        soft_skills = data.get('softSkills', '')
        target_role = data.get('targetRole', '')
        job_description = data.get('jobDescription', '')
        timeframe = data.get('timeframe', '')
        interests = data.get('interests', '')
        learning_style = data.get('learningStyle', '')
        time_commitment = data.get('timeCommitment', '')
        budget = data.get('budget', '')
        resume_analysis = data.get('resumeAnalysis', None)
        
        logger.debug(f"Extracted data - Target Role: {target_role}, Experience: {experience}")
        
        # Extract user's current skills
        user_skills = []
        if resume_analysis and 'skills' in resume_analysis:
            user_skills = resume_analysis['skills']
        else:
            # Extract skills from manually entered fields
            if technical_skills:
                user_skills.extend([s.strip().lower() for s in technical_skills.split(',') if s.strip()])
            if soft_skills:
                user_skills.extend([s.strip().lower() for s in soft_skills.split(',') if s.strip()])
        
        logger.debug(f"Extracted user skills: {user_skills}")
        
        # Validate required fields
        if not target_role:
            logger.error("Target role is missing")
            return jsonify({'error': 'Target role is required'}), 400
        if not job_description:
            logger.error("Job description is missing")
            return jsonify({'error': 'Job description is required'}), 400
        
        # Get career gap analysis from Groq
        logger.debug("Calling analyze_career_gap_with_groq")
        analysis = analyze_career_gap_with_groq(
            current_skills=user_skills,
            target_role=target_role,
            job_description=job_description,
            experience=experience,
            timeframe=timeframe,
            interests=interests,
            learning_style=learning_style,
            time_commitment=time_commitment,
            budget=budget
        )
        
        logger.debug(f"Received analysis from Groq: {analysis}")
        
        if 'error' in analysis:
            logger.error(f"Error in analysis: {analysis['error']}")
            return jsonify({'error': analysis['error']}), 500
        
        # Add additional context to the response
        response = {
            'analysis': analysis,
            'current_role': current_role,
            'target_role': target_role,
            'experience_level': experience,
            'timeframe': timeframe,
            'current_skills': user_skills,
            'display_format': {
                'sections': [
                    {
                        'title': 'Summary',
                        'type': 'summary',
                        'content': analysis.get('summary', {})
                    },
                    {
                        'title': 'Required Skills',
                        'type': 'list',
                        'content': analysis.get('required_skills', [])
                    },
                    {
                        'title': 'Skill Gaps',
                        'type': 'table',
                        'content': analysis.get('skill_gaps', [])
                    },
                    {
                        'title': 'Learning Path',
                        'type': 'timeline',
                        'content': analysis.get('learning_path', [])
                    },
                    {
                        'title': 'Milestones',
                        'type': 'timeline',
                        'content': analysis.get('milestones', [])
                    },
                    {
                        'title': 'Recommended Resources',
                        'type': 'cards',
                        'content': analysis.get('resources', [])
                    },
                    {
                        'title': 'Risk Assessment',
                        'type': 'table',
                        'content': analysis.get('risk_assessment', [])
                    }
                ]
            }
        }
        
        logger.debug("Successfully prepared response")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Unexpected error in assess_skills: {str(e)}", exc_info=True)
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})

@app.route('/api/save-assessment', methods=['POST'])
def save_assessment():
    """Save assessment results for a user"""
    try:
        data = request.json
        
        # Validate required fields
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract user information
        user_id = data.get('user_id', str(uuid.uuid4()))
        user_name = data.get('user_name', 'Anonymous User')
        user_email = data.get('user_email', f'user_{user_id}@example.com')
        
        # Extract assessment data
        target_role = data.get('target_role', '')
        current_role = data.get('current_role', '')
        experience = data.get('experience', '')
        timeframe = data.get('timeframe', '')
        assessment_results = data.get('assessment_results', {})
        
        # Generate a unique ID for the assessment
        assessment_id = str(uuid.uuid4())
        
        # Create user directory if it doesn't exist
        user_dir = os.path.join(DATA_FOLDER, user_id)
        os.makedirs(user_dir, exist_ok=True)
        
        # Save user info if it doesn't exist
        user_info_file = os.path.join(user_dir, 'user_info.json')
        if not os.path.exists(user_info_file):
            user_info = {
                'id': user_id,
                'name': user_name,
                'email': user_email,
                'created_at': datetime.now().isoformat()
            }
            with open(user_info_file, 'w') as f:
                json.dump(user_info, f, indent=2)
        
        # Create assessment directory
        assessment_dir = os.path.join(user_dir, assessment_id)
        os.makedirs(assessment_dir, exist_ok=True)
        
        # Prepare assessment data
        assessment_data = {
            'id': assessment_id,
            'user_id': user_id,
            'target_role': target_role,
            'current_role': current_role,
            'experience': experience,
            'timeframe': timeframe,
            'assessment_data': assessment_results,
            'created_at': datetime.now().isoformat(),
            'status': 'active'  # Add status field for tracking
        }
        
        # Save assessment data
        with open(os.path.join(assessment_dir, 'assessment.json'), 'w') as f:
            json.dump(assessment_data, f, indent=2)
        
        # Save milestones if they exist
        if assessment_results and 'analysis' in assessment_results and 'milestones' in assessment_results['analysis']:
            milestones = []
            for milestone in assessment_results['analysis']['milestones']:
                milestone_id = milestone.get('milestone', '').replace(' ', '_').lower()
                milestone_data = {
                    'id': str(uuid.uuid4()),
                    'assessment_id': assessment_id,
                    'milestone_id': milestone_id,
                    'milestone': milestone.get('milestone', ''),
                    'target_date': milestone.get('target_date', ''),
                    'status': 'not_started',
                    'notes': '',
                    'created_at': datetime.now().isoformat()
                }
                milestones.append(milestone_data)
            
            # Save milestones
            with open(os.path.join(assessment_dir, 'milestones.json'), 'w') as f:
                json.dump(milestones, f, indent=2)
        
        # Save learning path if it exists
        if assessment_results and 'analysis' in assessment_results and 'learning_path' in assessment_results['analysis']:
            learning_path = assessment_results['analysis']['learning_path']
            with open(os.path.join(assessment_dir, 'learning_path.json'), 'w') as f:
                json.dump(learning_path, f, indent=2)
        
        # Save skill gaps if they exist
        if assessment_results and 'analysis' in assessment_results and 'skill_gaps' in assessment_results['analysis']:
            skill_gaps = assessment_results['analysis']['skill_gaps']
            with open(os.path.join(assessment_dir, 'skill_gaps.json'), 'w') as f:
                json.dump(skill_gaps, f, indent=2)
        
        return jsonify({
            'message': 'Assessment saved successfully',
            'assessment_id': assessment_id,
            'user_id': user_id
        })
        
    except Exception as e:
        logger.error(f"Error saving assessment: {str(e)}", exc_info=True)
        return jsonify({'error': f'Error saving assessment: {str(e)}'}), 500

@app.route('/api/get-assessments/<user_id>', methods=['GET'])
def get_assessments(user_id):
    """Get all assessments for a user"""
    try:
        user_dir = os.path.join(DATA_FOLDER, user_id)
        if not os.path.exists(user_dir):
            return jsonify({'assessments': []})
        
        assessments = []
        for assessment_id in os.listdir(user_dir):
            if assessment_id == 'user_info.json':
                continue
                
            assessment_dir = os.path.join(user_dir, assessment_id)
            if os.path.isdir(assessment_dir):
                assessment_file = os.path.join(assessment_dir, 'assessment.json')
                if os.path.exists(assessment_file):
                    with open(assessment_file, 'r') as f:
                        assessment = json.load(f)
                        
                        # Load milestones if they exist
                        milestones_file = os.path.join(assessment_dir, 'milestones.json')
                        if os.path.exists(milestones_file):
                            with open(milestones_file, 'r') as mf:
                                milestones = json.load(mf)
                                # Calculate progress
                                total_milestones = len(milestones)
                                completed_milestones = len([m for m in milestones if m['status'] == 'completed'])
                                progress = (completed_milestones / total_milestones * 100) if total_milestones > 0 else 0
                                assessment['progress'] = progress
                        
                        assessments.append(assessment)
        
        # Sort assessments by created_at
        assessments.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return jsonify({
            'assessments': assessments
        })
        
    except Exception as e:
        logger.error(f"Error retrieving assessments: {str(e)}", exc_info=True)
        return jsonify({'error': f'Error retrieving assessments: {str(e)}'}), 500

@app.route('/api/get-assessment/<assessment_id>', methods=['GET'])
def get_assessment(assessment_id):
    """Get a specific assessment by ID"""
    try:
        # Find the assessment directory
        assessment_dir = None
        for user_id in os.listdir(DATA_FOLDER):
            user_dir = os.path.join(DATA_FOLDER, user_id)
            if os.path.isdir(user_dir):
                potential_dir = os.path.join(user_dir, assessment_id)
                if os.path.isdir(potential_dir):
                    assessment_dir = potential_dir
                    break
        
        if not assessment_dir:
            return jsonify({'error': 'Assessment not found'}), 404
        
        # Load assessment data
        assessment_file = os.path.join(assessment_dir, 'assessment.json')
        with open(assessment_file, 'r') as f:
            assessment = json.load(f)
        
        # Load milestones if they exist
        progress = []
        milestones_file = os.path.join(assessment_dir, 'milestones.json')
        if os.path.exists(milestones_file):
            with open(milestones_file, 'r') as f:
                progress = json.load(f)
        
        # Load learning path if it exists
        learning_path = []
        learning_path_file = os.path.join(assessment_dir, 'learning_path.json')
        if os.path.exists(learning_path_file):
            with open(learning_path_file, 'r') as f:
                learning_path = json.load(f)
        
        # Load skill gaps if they exist
        skill_gaps = []
        skill_gaps_file = os.path.join(assessment_dir, 'skill_gaps.json')
        if os.path.exists(skill_gaps_file):
            with open(skill_gaps_file, 'r') as f:
                skill_gaps = json.load(f)
        
        # Calculate overall progress
        total_milestones = len(progress)
        completed_milestones = len([m for m in progress if m['status'] == 'completed'])
        overall_progress = (completed_milestones / total_milestones * 100) if total_milestones > 0 else 0
        
        response = {
            'assessment': assessment,
            'progress': progress,
            'learning_path': learning_path,
            'skill_gaps': skill_gaps,
            'overall_progress': overall_progress
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error retrieving assessment: {str(e)}", exc_info=True)
        return jsonify({'error': f'Error retrieving assessment: {str(e)}'}), 500

@app.route('/api/update-progress', methods=['POST'])
def update_progress():
    """Update the status of a learning milestone"""
    try:
        data = request.json
        
        # Validate required fields
        if not data or 'progress_id' not in data or 'status' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        
        progress_id = data['progress_id']
        status = data['status']
        notes = data.get('notes', '')
        
        # Find the milestone file
        milestone_file = None
        for user_id in os.listdir(DATA_FOLDER):
            user_dir = os.path.join(DATA_FOLDER, user_id)
            if os.path.isdir(user_dir):
                for assessment_id in os.listdir(user_dir):
                    if assessment_id == 'user_info.json':
                        continue
                        
                    assessment_dir = os.path.join(user_dir, assessment_id)
                    if os.path.isdir(assessment_dir):
                        potential_file = os.path.join(assessment_dir, 'milestones.json')
                        if os.path.exists(potential_file):
                            with open(potential_file, 'r') as f:
                                milestones = json.load(f)
                                for milestone in milestones:
                                    if milestone['id'] == progress_id:
                                        milestone_file = potential_file
                                        # Update milestone
                                        milestone['status'] = status
                                        milestone['notes'] = notes
                                        if status == 'completed':
                                            milestone['completed_at'] = datetime.now().isoformat()
                                        else:
                                            milestone['completed_at'] = None
                                        break
                                if milestone_file:
                                    break
                    if milestone_file:
                        break
                if milestone_file:
                    break
        
        if not milestone_file:
            return jsonify({'error': 'Milestone not found'}), 404
        
        # Save updated milestones
        with open(milestone_file, 'w') as f:
            json.dump(milestones, f, indent=2)
        
        return jsonify({
            'message': 'Progress updated successfully'
        })
        
    except Exception as e:
        logger.error(f"Error updating progress: {str(e)}", exc_info=True)
        return jsonify({'error': f'Error updating progress: {str(e)}'}), 500

@app.route('/api/get-resources/<skill>', methods=['GET'])
def get_resources(skill):
    """Get learning resources for a specific skill"""
    try:
        max_results = request.args.get('max', 10, type=int)
        
        # Create resources directory if it doesn't exist
        resources_dir = os.path.join(DATA_FOLDER, 'resources')
        os.makedirs(resources_dir, exist_ok=True)
        
        # Load resources for the skill
        skill_file = os.path.join(resources_dir, f"{skill.lower().replace(' ', '_')}.json")
        resources = []
        
        if os.path.exists(skill_file):
            with open(skill_file, 'r') as f:
                resources = json.load(f)
        
        # If no resources found, try to find similar skills
        if not resources:
            # List of common skill variations
            skill_variations = {
                'python': ['programming', 'coding', 'software development'],
                'javascript': ['web development', 'frontend', 'programming'],
                'machine learning': ['ai', 'artificial intelligence', 'data science'],
                'data science': ['analytics', 'machine learning', 'statistics'],
                'web development': ['frontend', 'backend', 'full stack'],
                'cloud': ['aws', 'azure', 'gcp', 'devops'],
                'devops': ['cloud', 'automation', 'ci/cd'],
                'database': ['sql', 'nosql', 'data management'],
                'mobile': ['android', 'ios', 'react native'],
                'security': ['cybersecurity', 'information security', 'network security']
            }
            
            # Try to find resources for similar skills
            similar_skills = skill_variations.get(skill.lower(), [])
            for similar_skill in similar_skills:
                similar_file = os.path.join(resources_dir, f"{similar_skill.lower().replace(' ', '_')}.json")
                if os.path.exists(similar_file):
                    with open(similar_file, 'r') as f:
                        similar_resources = json.load(f)
                        resources.extend(similar_resources)
        
        # If still no resources, return default resources
        if not resources:
            resources = [
                {
                    "title": f"Introduction to {skill}",
                    "url": f"https://www.coursera.org/search?query={skill}",
                    "provider": "Coursera",
                    "source": "Coursera",
                    "resource_type": "course",
                    "price_type": "mixed",
                    "skill": skill
                },
                {
                    "title": f"Learn {skill} - Full Course for Beginners",
                    "url": f"https://www.youtube.com/results?search_query=learn+{skill}+tutorial",
                    "provider": "YouTube",
                    "source": "YouTube",
                    "resource_type": "video",
                    "price_type": "free",
                    "skill": skill
                },
                {
                    "title": f"{skill} Documentation",
                    "url": f"https://www.google.com/search?q={skill}+documentation",
                    "provider": "Official Documentation",
                    "source": "Documentation",
                    "resource_type": "documentation",
                    "price_type": "free",
                    "skill": skill
                }
            ]
        
        # Sort resources by rating if available
        resources.sort(key=lambda x: x.get('rating', 0), reverse=True)
        
        # Ensure we have a mix of resource types
        resource_types = ['course', 'video', 'documentation']
        final_resources = []
        for resource_type in resource_types:
            type_resources = [r for r in resources if r.get('resource_type', '').lower() == resource_type]
            if type_resources:
                final_resources.extend(type_resources[:max_results // len(resource_types)])
        
        # If we don't have enough resources, add more from the original list
        if len(final_resources) < max_results:
            remaining = [r for r in resources if r not in final_resources]
            final_resources.extend(remaining[:max_results - len(final_resources)])
        
        return jsonify({
            'skill': skill,
            'resources': final_resources[:max_results]
        })
        
    except Exception as e:
        logger.error(f"Error retrieving resources: {str(e)}", exc_info=True)
        return jsonify({'error': f'Error retrieving resources: {str(e)}'}), 500

@app.route('/api/generate-assessment', methods=['POST'])
def generate_assessment():
    try:
        # Check for data in form
        topic = request.form.get('topic')
        resume_file = request.files.get('resume')
        
        # Also check for JSON data if not in form
        if not topic and request.is_json:
            data = request.json
            topic = data.get('topic')
            
        if not topic and not resume_file:
            return jsonify({'error': 'Either topic or resume must be provided'}), 400

        logger.info(f"Generating assessment for topic: {topic}")

        # Extract skills from resume if provided
        skills = []
        if resume_file:
            if not allowed_file(resume_file.filename):
                return jsonify({'error': 'Invalid file type'}), 400
            
            filename = secure_filename(resume_file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            resume_file.save(file_path)
            
            # Extract text from resume
            text = extract_text_from_file(file_path)
            skills = extract_skills_from_text(text)
            
            # Clean up the file
            os.remove(file_path)

        # Generate questions using Groq
        prompt = f"""Generate a comprehensive skill assessment with 10 multiple-choice questions.
        {'Based on the following skills: ' + ', '.join(skills) if skills else f'On the topic of: {topic}'}
        
        Create 10 questions that test both theoretical knowledge and practical application. The questions should be of medium difficulty level - challenging enough for professionals but not extremely advanced.
        
        For each question, provide:
        1. A clear and specific question
        2. Four possible answers (A, B, C, D)
        3. The correct answer
        
        Format the response as a JSON object with the following structure:
        {{
            "questions": [
                {{
                    "question": "Question text",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": "Option A"
                }}
                // 9 more questions with similar structure
            ],
            "topic": "{topic if topic else 'Skill Assessment'}"
        }}
        
        VERY IMPORTANT: 
        1. Return ONLY the JSON object without any additional text, comments, markdown formatting, or explanations.
        2. Ensure the questions are of medium difficulty level.
        3. Include a mix of theoretical and practical questions.
        4. Make sure all 10 questions cover different aspects of the topic(s)."""

        completion = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert at creating skill assessment questions. Always respond with only the requested JSON format, without any additional text or explanations."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=3000,
            top_p=1,
            stream=False
        )

        response_text = completion.choices[0].message.content
        logger.info(f"Raw response from Groq (first 200 chars): {response_text[:200]}")
        
        try:
            # Try to extract JSON from markdown if present
            import re
            json_match = re.search(r'```(?:json)?(.*?)```', response_text, re.DOTALL)
            if json_match:
                # Extract JSON from markdown code block
                cleaned_json = json_match.group(1).strip()
                logger.info(f"Extracted JSON from markdown code block")
            else:
                # Try to find JSON object within the text
                json_match = re.search(r'({.*})', response_text, re.DOTALL)
                if json_match:
                    cleaned_json = json_match.group(1).strip()
                    logger.info(f"Extracted JSON from text")
                else:
                    # Use the full response as is
                    cleaned_json = response_text.strip()
                    logger.info(f"Using full response as JSON")
            
            assessment_data = json.loads(cleaned_json)
            
            # Validate the assessment data structure
            if 'questions' not in assessment_data or not isinstance(assessment_data['questions'], list):
                logger.error("Missing or invalid 'questions' field in assessment data")
                return jsonify({'error': 'Invalid assessment data format'}), 500
                
            # Ensure each question has the required fields and format them correctly
            for i, question in enumerate(assessment_data['questions']):
                # Make sure we have options as a list
                if 'options' not in question or not isinstance(question['options'], list):
                    logger.error(f"Missing or invalid 'options' in question {i+1}")
                    return jsonify({'error': f'Invalid options format in question {i+1}'}), 500
                
                # Convert correctAnswer from letter to option text if needed
                if 'correctAnswer' in question and question['correctAnswer'] in ['A', 'B', 'C', 'D']:
                    index = ord(question['correctAnswer']) - ord('A')
                    if 0 <= index < len(question['options']):
                        question['correctAnswer'] = question['options'][index]
                    
            logger.info(f"Successfully processed assessment with {len(assessment_data['questions'])} questions")
            return jsonify(assessment_data)
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {str(e)}")
            logger.error(f"Raw response: {response_text}")
            return jsonify({'error': 'Failed to generate assessment'}), 500

    except Exception as e:
        logger.error(f"Error in generate_assessment: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)