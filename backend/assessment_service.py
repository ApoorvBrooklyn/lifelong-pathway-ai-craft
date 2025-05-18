import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import groq
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class AssessmentService:
    def __init__(self):
        self.groq_client = groq.Client(api_key=os.getenv("GROQ_API_KEY"))
        self.certificates_dir = "data/certificates"
        os.makedirs(self.certificates_dir, exist_ok=True)

    async def generate_test(self, topics: List[str], num_questions: int = 10) -> List[Dict[str, Any]]:
        """Generate a test using GROQ API based on provided topics"""
        try:
            prompt = f"""Generate a technical assessment test with {num_questions} questions covering the following topics: {', '.join(topics)}.
            For each question, provide:
            1. The question text
            2. Four multiple choice options (A, B, C, D)
            3. The correct answer (A, B, C, or D)
            4. A brief explanation of why the answer is correct
            
            Format the response as a JSON array of question objects.
            Each question should be challenging but fair, testing both theoretical knowledge and practical understanding."""

            response = self.groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="mixtral-8x7b-32768",
                temperature=0.7,
                max_tokens=2000
            )

            # Parse the response to get questions
            questions = json.loads(response.choices[0].message.content)
            return questions

        except Exception as e:
            logger.error(f"Error generating test: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to generate test")

    async def evaluate_test(self, answers: Dict[str, str], questions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Evaluate test answers and calculate score"""
        try:
            correct_answers = 0
            total_questions = len(questions)
            feedback = []

            for i, question in enumerate(questions):
                question_id = str(i + 1)
                user_answer = answers.get(question_id)
                correct_answer = question['correct_answer']
                
                is_correct = user_answer == correct_answer
                if is_correct:
                    correct_answers += 1
                
                feedback.append({
                    'question': question['question'],
                    'user_answer': user_answer,
                    'correct_answer': correct_answer,
                    'explanation': question['explanation'],
                    'is_correct': is_correct
                })

            score = (correct_answers / total_questions) * 100
            passed = score >= 75

            return {
                'score': score,
                'passed': passed,
                'total_questions': total_questions,
                'correct_answers': correct_answers,
                'feedback': feedback
            }

        except Exception as e:
            logger.error(f"Error evaluating test: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to evaluate test")

    async def generate_certificate(self, user_id: str, topics: List[str], score: float) -> Dict[str, Any]:
        """Generate a certificate for passed assessments"""
        try:
            if score < 75:
                return None

            certificate_data = {
                'user_id': user_id,
                'topics': topics,
                'score': score,
                'date_issued': datetime.now().isoformat(),
                'certificate_id': f"CERT-{user_id}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            }

            # Save certificate data
            certificate_file = os.path.join(self.certificates_dir, f"{certificate_data['certificate_id']}.json")
            with open(certificate_file, 'w') as f:
                json.dump(certificate_data, f, indent=2)

            return certificate_data

        except Exception as e:
            logger.error(f"Error generating certificate: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to generate certificate")

    async def extract_topics_from_resume(self, resume_text: str) -> List[str]:
        """Extract relevant technical topics from resume text using GROQ API"""
        try:
            prompt = f"""Analyze the following resume text and extract relevant technical topics and skills that could be tested.
            Focus on technical skills, programming languages, frameworks, tools, and methodologies.
            Return the results as a JSON array of strings.

            Resume text:
            {resume_text}"""

            response = self.groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="mixtral-8x7b-32768",
                temperature=0.3,
                max_tokens=1000
            )

            topics = json.loads(response.choices[0].message.content)
            return topics

        except Exception as e:
            logger.error(f"Error extracting topics from resume: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to extract topics from resume") 