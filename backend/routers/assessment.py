from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
from ..assessment_service import AssessmentService
from ..auth import get_current_user
import json

router = APIRouter(prefix="/assessment", tags=["assessment"])
assessment_service = AssessmentService()

class TestRequest(BaseModel):
    topics: List[str]
    num_questions: int = 10

class TestAnswers(BaseModel):
    answers: Dict[str, str]

@router.post("/generate-test")
async def generate_test(
    request: TestRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """Generate a test based on provided topics"""
    return await assessment_service.generate_test(request.topics, request.num_questions)

@router.post("/evaluate-test")
async def evaluate_test(
    answers: TestAnswers,
    questions: List[Dict[str, Any]],
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Evaluate test answers and generate certificate if passed"""
    result = await assessment_service.evaluate_test(answers.answers, questions)
    
    if result['passed']:
        certificate = await assessment_service.generate_certificate(
            current_user['id'],
            [q['topic'] for q in questions],
            result['score']
        )
        result['certificate'] = certificate
    
    return result

@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> List[str]:
    """Upload resume and extract topics for assessment"""
    if not file.filename.endswith(('.pdf', '.doc', '.docx', '.txt')):
        raise HTTPException(status_code=400, detail="Invalid file format")
    
    content = await file.read()
    resume_text = content.decode('utf-8')
    
    topics = await assessment_service.extract_topics_from_resume(resume_text)
    return topics

@router.get("/certificates/{user_id}")
async def get_user_certificates(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """Get all certificates for a user"""
    if current_user['id'] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view these certificates")
    
    certificates = []
    for file in assessment_service.certificates_dir.glob(f"CERT-{user_id}-*.json"):
        with open(file, 'r') as f:
            certificates.append(json.load(f))
    
    return certificates 