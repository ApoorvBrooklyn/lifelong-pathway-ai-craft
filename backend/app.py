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

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit file size to 16MB

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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
    """Extract skills from text using NLP"""
    # Common technical skills and keywords
    skill_keywords = [
        'python', 'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js',
        'java', 'c#', 'c++', 'ruby', 'php', 'swift', 'kotlin', 'html', 'css',
        'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'aws', 'azure', 'gcp',
        'docker', 'kubernetes', 'git', 'ci/cd', 'agile', 'scrum', 'devops',
        'machine learning', 'ai', 'data science', 'blockchain', 'ux', 'ui',
        'testing', 'qa', 'linux', 'windows', 'macos', 'ios', 'android',
        'rest api', 'graphql', 'microservices', 'security', 'networking',
        'leadership', 'communication', 'teamwork', 'problem solving', 'creativity'
    ]
    
    # Process text with spaCy
    doc = nlp(text.lower())
    
    # Extract skills using named entity recognition and pattern matching
    skills = []
    
    # Pattern matching for skills
    for skill in skill_keywords:
        if re.search(r'\b' + skill + r'\b', text.lower()):
            skills.append(skill)
    
    return skills

def analyze_resume(file_path):
    """Analyze resume text to extract relevant information"""
    text = extract_text_from_file(file_path)
    skills = extract_skills_from_text(text)
    
    # Calculate skill scores (simplified version)
    # In a real implementation, you'd use a more sophisticated model
    technical_score = 0
    soft_score = 0
    
    technical_skills = ['python', 'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js',
                       'java', 'c#', 'c++', 'ruby', 'php', 'swift', 'kotlin', 'html', 'css',
                       'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'aws', 'azure', 'gcp',
                       'docker', 'kubernetes', 'git', 'ci/cd', 'rest api', 'graphql', 'microservices']
                       
    soft_skills = ['agile', 'scrum', 'leadership', 'communication', 'teamwork', 
                  'problem solving', 'creativity', 'management']
    
    for skill in skills:
        if skill in technical_skills:
            technical_score += 1
        if skill in soft_skills:
            soft_score += 1
    
    # Normalize scores
    technical_score = min(100, technical_score * 10)
    soft_score = min(100, soft_score * 15)
    
    analysis = {
        'skills': skills,
        'technical_score': technical_score,
        'communication_score': soft_score,
        'leadership_score': max(20, soft_score - 30),  # Simple heuristic
        'problem_solving_score': technical_score * 0.9,
        'creativity_score': (technical_score + soft_score) / 2
    }
    
    return analysis

@app.route('/api/upload-resume', methods=['POST'])
def upload_resume():
    """Endpoint to upload and process a resume"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        # Generate unique filename
        filename = secure_filename(file.filename)
        unique_filename = f"{str(uuid.uuid4())}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        # Save the uploaded file
        file.save(file_path)
        
        try:
            # Analyze the resume
            analysis_results = analyze_resume(file_path)
            
            # Return analysis results
            return jsonify({
                'message': 'Resume uploaded and analyzed successfully',
                'analysis': analysis_results
            })
        except Exception as e:
            return jsonify({'error': f'Error analyzing resume: {str(e)}'}), 500
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/assess-skills', methods=['POST'])
def assess_skills():
    """Endpoint to process skill assessment data using ML-based approach"""
    data = request.json
    
    if not data:
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
    
    # Extract required skills from job description using NLP
    required_skills = []
    if job_description:
        # Process job description with spaCy
        doc = nlp(job_description.lower())
        
        # Use the same skill keywords list for consistency
        skill_keywords = [
            'python', 'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js',
            'java', 'c#', 'c++', 'ruby', 'php', 'swift', 'kotlin', 'html', 'css',
            'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'aws', 'azure', 'gcp',
            'docker', 'kubernetes', 'git', 'ci/cd', 'agile', 'scrum', 'devops',
            'machine learning', 'ai', 'data science', 'blockchain', 'ux', 'ui',
            'testing', 'qa', 'linux', 'windows', 'macos', 'ios', 'android',
            'rest api', 'graphql', 'microservices', 'security', 'networking',
            'leadership', 'communication', 'teamwork', 'problem solving', 'creativity',
            'project management', 'product management', 'data analysis', 'algorithms',
            'system design', 'architecture', 'scalability', 'performance', 'optimization',
            'debugging', 'testing', 'continuous integration', 'continuous deployment',
            'backend', 'frontend', 'full-stack', 'web development', 'mobile development',
            'cloud computing', 'devops', 'database management', 'api development',
            'version control', 'cross-functional collaboration'
        ]
        
        # Extract required skills from job description
        for skill in skill_keywords:
            if re.search(r'\b' + re.escape(skill) + r'\b', job_description.lower()):
                required_skills.append(skill)
    
    # Identify skill gaps - skills required but not possessed by the user
    skill_gaps = []
    if required_skills:
        skill_gaps = [skill for skill in required_skills if skill not in user_skills]
    
    # Calculate experience factor (0-1 scale)
    experience_factor = 0.5  # default
    if experience == "0-1":
        experience_factor = 0.2
    elif experience == "1-3":
        experience_factor = 0.4
    elif experience == "3-5":
        experience_factor = 0.6
    elif experience == "5-10":
        experience_factor = 0.8
    elif experience == "10+":
        experience_factor = 1.0
    
    # Calculate timeline factor (0-1 scale) - shorter timeline means more urgency
    timeline_factor = 0.5  # default
    if timeframe == "6m":
        timeline_factor = 0.9
    elif timeframe == "1y":
        timeline_factor = 0.7
    elif timeframe == "2y":
        timeline_factor = 0.5
    elif timeframe == "5y":
        timeline_factor = 0.3
        
    # Calculate commitment factor (0-1 scale)
    commitment_factor = 0.5  # default
    if time_commitment == "1-3":
        commitment_factor = 0.3
    elif time_commitment == "4-7":
        commitment_factor = 0.5
    elif time_commitment == "8-15":
        commitment_factor = 0.8
    elif time_commitment == "16+":
        commitment_factor = 1.0
    
    # Process score calculation with all available inputs
    # If resume analysis is available, use those scores as a starting point
    if resume_analysis:
        skill_scores = {
            'technical': resume_analysis.get('technical_score', 70),
            'communication': resume_analysis.get('communication_score', 60),
            'leadership': resume_analysis.get('leadership_score', 50),
            'problem_solving': resume_analysis.get('problem_solving_score', 75),
            'creativity': resume_analysis.get('creativity_score', 65)
        }
    else:
        # Generate scores based on input text and factors
        combined_input = f"{current_role} {technical_skills} {soft_skills} {target_role} {interests}"
        
        tech_keywords = ['python', 'javascript', 'react', 'vue', 'angular', 'node', 'java', 'c#', 'c++', 
                       'aws', 'cloud', 'database', 'sql', 'algorithm', 'api', 'backend', 'frontend']
        soft_keywords = ['communicate', 'lead', 'manage', 'collaborate', 'team', 'problem-solving', 
                        'creativity', 'adaptability', 'presentation', 'mentoring']
        
        # Adjust scoring based on extracted skills and input factors
        technical_score = sum(10 for word in tech_keywords if word.lower() in combined_input.lower())
        soft_score = sum(15 for word in soft_keywords if word.lower() in combined_input.lower())
        
        # Adjust scores based on experience and other factors
        technical_score = min(100, max(30, technical_score * (0.8 + experience_factor * 0.4)))
        soft_score = min(100, max(30, soft_score * (0.7 + experience_factor * 0.5)))
        
        # Calculate derived scores
        leadership_score = max(30, soft_score - 20 + (experience_factor * 15))
        problem_solving_score = max(40, technical_score - 10 + (commitment_factor * 10))
        creativity_score = max(40, (technical_score + soft_score) // 2)
        
        skill_scores = {
            'technical': technical_score,
            'communication': soft_score,
            'leadership': leadership_score,
            'problem_solving': problem_solving_score,
            'creativity': creativity_score
        }
    
    # Categorize skill gaps by priority
    high_priority_gaps = []
    medium_priority_gaps = []
    
    for skill in skill_gaps:
        # Assess criticality based on frequency in job description
        occurrences = len(re.findall(r'\b' + skill + r'\b', job_description.lower()))
        if occurrences > 1 or timeline_factor > 0.7:
            high_priority_gaps.append(skill)
        else:
            medium_priority_gaps.append(skill)
    
    # Generate personalized recommendations based on the scores and context
    recommendations = []
    gap_recommendations = []
    improvement_recommendations = []
    
    # Technical skills recommendations
    if skill_scores['technical'] < 60:
        recommendations.append("Focus on building technical fundamentals in your domain")
    elif skill_scores['technical'] < 80:
        recommendations.append("Strengthen advanced technical concepts in your target role area")
    else:
        recommendations.append("Maintain and mentor others in technical skills while focusing on other areas")
    
    # Leadership recommendations
    if skill_scores['leadership'] < 60:
        recommendations.append("Develop leadership skills through team projects and conflict resolution practice")
    else:
        recommendations.append("Seek opportunities to lead cross-functional initiatives to enhance leadership abilities")
    
    # Learning style-specific recommendations
    learning_method = ""
    if learning_style == "visual":
        learning_method = "video courses and visual learning materials"
    elif learning_style == "reading":
        learning_method = "books, articles, and documentation"
    elif learning_style == "interactive":
        learning_method = "hands-on projects and interactive workshops"
    elif learning_style == "audio_video":
        learning_method = "podcasts, video tutorials, and recorded lectures"
    
    # Time commitment and budget-aware recommendation
    if learning_method:
        if time_commitment in ["1-3", "4-7"] and budget in ["free", "low"]:
            recommendations.append(f"Allocate your limited time to focused {learning_method} that target your highest priority skill gaps")
        elif time_commitment in ["8-15", "16+"] and budget in ["medium", "high"]:
            recommendations.append(f"Invest in intensive {learning_method} like bootcamps or certification programs")
        else:
            recommendations.append(f"Utilize {learning_method} while balancing your time and budget constraints")
    
    # Gap-specific recommendations
    if high_priority_gaps:
        gap_text = ", ".join(high_priority_gaps[:3])
        if len(high_priority_gaps) > 3:
            gap_text += f", and {len(high_priority_gaps) - 3} more"
        gap_recommendations.append(f"High Priority Skills to Develop: {gap_text}")
    
    if medium_priority_gaps:
        gap_text = ", ".join(medium_priority_gaps[:3])
        if len(medium_priority_gaps) > 3:
            gap_text += f", and {len(medium_priority_gaps) - 3} more"
        gap_recommendations.append(f"Medium Priority Skills to Develop: {gap_text}")
    
    # Generate target role achievement timeline based on gaps and commitment
    months_estimate = 12  # Default 1 year
    if high_priority_gaps:
        # Adjust based on number of gaps and commitment
        gap_factor = len(high_priority_gaps) + len(medium_priority_gaps) * 0.5
        months_estimate = int(gap_factor * 3 / commitment_factor)
        months_estimate = max(3, min(36, months_estimate))  # Keep between 3-36 months
        
    if timeframe == "6m" and months_estimate > 6:
        improvement_recommendations.append(f"Your target timeline of 6 months may be challenging. Consider extending to {months_estimate} months or increasing your time commitment.")
    elif timeframe == "1y" and months_estimate > 12:
        improvement_recommendations.append(f"Based on your skill gaps, we estimate {months_estimate} months to reach your target role. Consider increasing your weekly learning time.")
    
    # Calculate the weighted improvement opportunities
    areas_for_improvement = []
    scores_list = [
        ("technical_skills", skill_scores['technical']),
        ("communication", skill_scores['communication']),
        ("leadership", skill_scores['leadership']),
        ("problem_solving", skill_scores['problem_solving']),
        ("creativity", skill_scores['creativity'])
    ]
    
    # Sort by score (ascending) to find weakest areas
    scores_list.sort(key=lambda x: x[1])
    
    # Add specific improvement recommendations for lowest 2 scores
    for area, score in scores_list[:2]:
        if area == "technical_skills" and score < 70:
            areas_for_improvement.append("Technical skills: Focus on hands-on projects to build proficiency")
        elif area == "communication" and score < 70:
            areas_for_improvement.append("Communication: Practice presenting technical concepts to non-technical audiences")
        elif area == "leadership" and score < 70:
            areas_for_improvement.append("Leadership: Volunteer to lead small projects or mentor junior team members")
        elif area == "problem_solving" and score < 70:
            areas_for_improvement.append("Problem solving: Work on algorithm challenges and system design exercises")
        elif area == "creativity" and score < 70:
            areas_for_improvement.append("Creativity: Explore innovative solutions to existing problems in your domain")
    
    # Return comprehensive assessment results
    assessment_result = {
        'skillScores': [
            {'name': 'Technical Skills', 'value': int(skill_scores['technical']), 'color': '#3182CE'},
            {'name': 'Communication', 'value': int(skill_scores['communication']), 'color': '#38B2AC'},
            {'name': 'Leadership', 'value': int(skill_scores['leadership']), 'color': '#4C51BF'},
            {'name': 'Problem Solving', 'value': int(skill_scores['problem_solving']), 'color': '#2C7A7B'},
            {'name': 'Creativity', 'value': int(skill_scores['creativity']), 'color': '#2B6CB0'}
        ],
        'recommendations': recommendations,
        'skillGaps': {
            'highPriority': high_priority_gaps,
            'mediumPriority': medium_priority_gaps
        },
        'gapRecommendations': gap_recommendations,
        'improvementAreas': areas_for_improvement,
        'timelineRecommendations': improvement_recommendations,
        'estimatedMonths': months_estimate
    }
    
    return jsonify(assessment_result)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 