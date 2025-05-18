# Lifelong Pathway AI Craft

A modern career development platform that uses AI to help users assess their skills, identify gaps, and create personalized learning paths to reach their career goals.

## Features

- **Skills Assessment**: Evaluate your current technical and soft skills through AI-powered analysis
- **Career Path Generation**: Get personalized learning paths based on your target role and current skills
- **Learning Path Dashboard**: Track your progress through interactive milestones
- **Skill Gap Analysis**: Identify the skills you need to develop for your desired role
- **Curated Resources**: Get personalized learning resources based on your learning style and budget
- **Progress Tracking**: Mark milestones as in-progress or completed to track your journey

## Technology Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Router for navigation

### Backend
- Python with Flask
- Groq API for AI language model capabilities
- File-based data storage
- Milvus vector database (optional)

## Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- Groq API key (for AI capabilities)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/lifelong-pathway-ai-craft.git
cd lifelong-pathway-ai-craft
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```

4. Set up your Groq API key in the backend
```bash
# Add your key to the backend/app.py file or use an environment variable
```

### Running the application

1. Start the backend server
```bash
cd backend
python app.py
```

2. Start the frontend development server
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:8080`

## Usage Guide

### Creating Your First Assessment

1. Click on "New Assessment" from the dashboard or navigate to the assessment page
2. Fill in your current skills, experience, and target role
3. Optionally upload your resume for automated skills extraction
4. Complete all assessment steps including learning preferences
5. Submit to receive your personalized career path

### Tracking Your Progress

1. View your generated learning paths on the dashboard
2. Click "Track Progress" to update milestone status
3. Mark milestones as "In Progress" or "Completed"
4. Navigate to the detailed learning path view to see skill gaps and resources

### Managing Learning Paths

- Refresh your assessments anytime from the dashboard
- View detailed information by clicking on a specific learning path
- Delete learning paths you no longer need from the dashboard or learning path view

## Project Structure

```
lifelong-pathway-ai-craft/
├── frontend/              # React frontend application
│   ├── src/               # Source code
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── providers/     # Context providers
│   │   └── hooks/         # Custom React hooks
│   └── public/            # Static assets
└── backend/               # Flask backend application
    ├── app.py             # Main application file
    ├── data/              # Data storage directory
    └── uploads/           # Temporary upload directory
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Groq API](https://groq.com) for providing the AI language model capabilities
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
