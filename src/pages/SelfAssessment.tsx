import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@/providers/SessionProvider";
import { Progress } from "@/components/ui/progress";

interface Question {
  question: string;
  options: string[];
  correctAnswer?: string;
}

const SelfAssessment = () => {
  const { user, loading: isLoadingSession } = useSession();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);

  const generateAssessment = async () => {
    if (!topics.trim()) {
      toast({
        title: "Error",
        description: "Please enter topics or skills to assess",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create FormData - the backend is specifically looking for form data
      const formData = new FormData();
      formData.append('topic', topics);
      
      console.log('Sending topic:', topics);
      
      const response = await fetch('/api/generate-assessment', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to generate assessment: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Assessment data:', data);
      
      if (!data.questions || !Array.isArray(data.questions)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format');
      }

      // Clean up the questions to ensure they have all required fields
      const formattedQuestions = data.questions.map((q: Question) => ({
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer || q.options?.[0] || ''
      }));
      
      console.log('Formatted questions:', formattedQuestions);
      
      setQuestions(formattedQuestions);
      setCurrentQuestion(0);
      setAnswers([]);
      setCorrectAnswers([]);
      setScore(null);
      
      toast({
        title: "Assessment Generated",
        description: `Successfully created assessment with ${formattedQuestions.length} questions on ${topics}`,
      });
    } catch (error) {
      console.error('Error generating assessment:', error);
      toast({
        title: "Error",
        description: "Failed to generate assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    // Check if the answer is correct
    const isCorrect = answer === questions[currentQuestion].correctAnswer;
    const newCorrectAnswers = [...correctAnswers];
    if (isCorrect) {
      newCorrectAnswers.push(currentQuestion);
      setCorrectAnswers(newCorrectAnswers);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score and show results
      const score = (newCorrectAnswers.length / questions.length) * 100;
      setScore(score);
    }
  };
  
  const getProgressPercentage = () => {
    if (questions.length === 0) return 0;
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (isLoadingSession) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Self Assessment</h1>
      
      {questions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Start Your Self Assessment</CardTitle>
            <CardDescription>
              Enter the topics or skills you want to assess yourself on
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topics">Topics or Skills (comma-separated)</Label>
                <Textarea
                  id="topics"
                  placeholder="e.g., JavaScript, React, Node.js"
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                />
              </div>
              <Button 
                onClick={generateAssessment} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Generating..." : "Generate Assessment"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : score === null ? (
        <Card>
          <CardHeader>
            <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
            <CardDescription>
              Topic: {topics}
            </CardDescription>
            <div className="mt-2">
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-lg font-medium">{questions[currentQuestion].question}</p>
              <div className="space-y-2">
                {questions[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left py-3 h-auto"
                    onClick={() => handleAnswer(option)}
                  >
                    <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span> {option}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={goToPreviousQuestion} 
              disabled={currentQuestion === 0 || answers.length <= currentQuestion}
            >
              Previous Question
            </Button>
            <div className="text-sm text-muted-foreground">
              {currentQuestion + 1} of {questions.length}
            </div>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Assessment Results</CardTitle>
            <CardDescription>
              Assessment on: {topics}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-3xl font-bold mb-2">{score.toFixed(1)}%</p>
                <p className="text-muted-foreground">
                  You answered {correctAnswers.length} out of {questions.length} questions correctly
                </p>
              </div>
              
              <Progress value={score} className="h-2" />
              
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold">Performance Summary</h3>
                {score >= 80 ? (
                  <p>Excellent work! You have a strong understanding of these topics.</p>
                ) : score >= 60 ? (
                  <p>Good job! You have a solid foundation but might benefit from more practice.</p>
                ) : (
                  <p>You might need more study in these areas. Consider reviewing the topics again.</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => {
                setQuestions([]);
                setScore(null);
                setAnswers([]);
                setCorrectAnswers([]);
              }}
              className="w-full mr-2"
            >
              Take Another Assessment
            </Button>
            <Button 
              onClick={() => {
                // Reset for the same topics
                setScore(null);
                setCurrentQuestion(0);
                setAnswers([]);
                setCorrectAnswers([]);
              }}
              className="w-full ml-2"
            >
              Retry Same Topics
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default SelfAssessment; 