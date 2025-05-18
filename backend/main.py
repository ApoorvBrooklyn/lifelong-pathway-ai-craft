from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import assessment

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(assessment.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Lifelong Pathway AI API"} 