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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MultipleChoiceQuestion {
  question: string;
  options: string[];
  correctAnswer?: string;
  type: 'multiple_choice';
}

interface CodingQuestion {
  question: string;
  examples?: Array<{ input: string, output: string }>;
  constraints?: string;
  starter_code?: string;
  solution?: string;
  type: 'coding';
}

type Question = MultipleChoiceQuestion | CodingQuestion;

const SelfAssessment = () => {
  const { user, loading: isLoadingSession } = useSession();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [codingAnswers, setCodingAnswers] = useState<string[]>([]);
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

      // Initialize the coding answers array with empty strings for each coding question
      const newCodingAnswers = new Array(data.questions.filter(q => q.type === 'coding').length).fill('');
      setCodingAnswers(newCodingAnswers);
      
      // Initialize answers array with nulls to match the length of questions
      const initialAnswers = new Array(data.questions.length).fill(null);
      setAnswers(initialAnswers);
      
      setQuestions(data.questions);
      setCurrentQuestion(0);
      setCorrectAnswers([]);
      setScore(null);
      
      toast({
        title: "Assessment Generated",
        description: `Successfully created assessment with ${data.questions.length} questions on ${topics}`,
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

  const handleMultipleChoiceAnswer = (answer: string) => {
    // Create a new answers array with this answer
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
    
    // Check if the answer is correct
    const question = questions[currentQuestion] as MultipleChoiceQuestion;
    const isCorrect = answer === question.correctAnswer;
    
    if (isCorrect && !correctAnswers.includes(currentQuestion)) {
      setCorrectAnswers([...correctAnswers, currentQuestion]);
    } else if (!isCorrect && correctAnswers.includes(currentQuestion)) {
      setCorrectAnswers(correctAnswers.filter(i => i !== currentQuestion));
    }

    // Move to next question
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleCodingAnswerChange = (answer: string) => {
    // Find the index of this coding question among all coding questions
    const codingQuestionIndex = questions
      .slice(0, currentQuestion + 1)
      .filter(q => q.type === 'coding')
      .length - 1;
    
    // Update the coding answers array
    const newCodingAnswers = [...codingAnswers];
    newCodingAnswers[codingQuestionIndex] = answer;
    setCodingAnswers(newCodingAnswers);
    
    // Also update the main answers array
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleCodingSubmit = () => {
    // For simplicity, we're not actually evaluating the code
    // In a real implementation, you would send the code to a backend for evaluation
    
    // Move to next question
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const finishAssessment = () => {
    // Count correct multiple choice answers
    const multipleChoiceCorrect = correctAnswers.length;
    
    // For coding questions, we'll just check if they submitted something
    // In a real implementation, you would evaluate the code
    const codingQuestions = questions.filter(q => q.type === 'coding');
    
    // Calculate score
    // For simplicity, each question is worth the same (we could weight coding questions more in a real implementation)
    const totalScore = ((multipleChoiceCorrect + codingAnswers.filter(a => a.trim().length > 0).length) / questions.length) * 100;
    setScore(totalScore);
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

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    
    if (question.type === 'multiple_choice') {
      return (
        <div className="space-y-4">
          <p className="text-lg font-medium">{question.question}</p>
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant={answers[currentQuestion] === option ? "default" : "outline"}
                className="w-full justify-start text-left py-3 h-auto"
                onClick={() => handleMultipleChoiceAnswer(option)}
              >
                <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span> {option}
              </Button>
            ))}
          </div>
        </div>
      );
    } else if (question.type === 'coding') {
      // Find the index of this coding question among all coding questions
      const codingQuestionIndex = questions
        .slice(0, currentQuestion + 1)
        .filter(q => q.type === 'coding')
        .length - 1;
        
      const codingAnswer = codingAnswers[codingQuestionIndex] || question.starter_code || '';
      
      return (
        <div className="space-y-4">
          <p className="text-lg font-medium">{question.question}</p>
          
          {question.examples && question.examples.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Examples:</h4>
              {question.examples.map((example, idx) => (
                <div key={idx} className="bg-muted p-3 rounded-md mb-2">
                  <p><strong>Input:</strong> {example.input}</p>
                  <p><strong>Output:</strong> {example.output}</p>
                </div>
              ))}
            </div>
          )}
          
          {question.constraints && (
            <div className="mt-2">
              <h4 className="font-medium mb-1">Constraints:</h4>
              <p className="text-sm">{question.constraints}</p>
            </div>
          )}
          
          <div className="mt-4">
            <Label htmlFor="code">Your Solution:</Label>
            <Textarea
              id="code"
              value={codingAnswer}
              onChange={(e) => handleCodingAnswerChange(e.target.value)}
              className="font-mono h-64"
              placeholder={question.starter_code || "// Write your solution here"}
            />
          </div>
          
          <Button 
            onClick={handleCodingSubmit} 
            className="mt-2"
          >
            Submit & Continue
          </Button>
          
          <Tabs defaultValue="problem">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="problem">Problem</TabsTrigger>
              <TabsTrigger value="solution">Solution (After Submission)</TabsTrigger>
            </TabsList>
            <TabsContent value="problem">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-lg font-medium">{question.question}</p>
                  {question.examples && question.examples.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Examples:</h4>
                      {question.examples.map((example, idx) => (
                        <div key={idx} className="bg-muted p-3 rounded-md mb-2">
                          <p><strong>Input:</strong> {example.input}</p>
                          <p><strong>Output:</strong> {example.output}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {question.constraints && (
                    <div className="mt-2">
                      <h4 className="font-medium mb-1">Constraints:</h4>
                      <p className="text-sm">{question.constraints}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="solution">
              <Card>
                <CardContent className="pt-4">
                  {answers[currentQuestion] ? (
                    <div>
                      <h4 className="font-medium mb-2">Sample Solution:</h4>
                      <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                        <code>{question.solution}</code>
                      </pre>
                    </div>
                  ) : (
                    <p>Submit your answer first to see the solution.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      );
    }
    
    return null;
  };

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
            <CardTitle>
              {questions[currentQuestion].type === 'multiple_choice' ? 'Multiple Choice Question' : 'Coding Challenge'} {currentQuestion + 1} of {questions.length}
            </CardTitle>
            <CardDescription>
              Topic: {topics}
            </CardDescription>
            <div className="mt-2">
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>
          </CardHeader>
          <CardContent>
            {renderQuestion()}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={goToPreviousQuestion} 
              disabled={currentQuestion === 0}
            >
              Previous Question
            </Button>
            
            <div className="text-sm text-muted-foreground">
              {currentQuestion + 1} of {questions.length}
            </div>
            
            {currentQuestion === questions.length - 1 && (
              <Button 
                onClick={finishAssessment}
                disabled={answers[currentQuestion] === null}
              >
                Finish Assessment
              </Button>
            )}
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
                  You answered {correctAnswers.length} out of {questions.filter(q => q.type === 'multiple_choice').length} multiple choice questions correctly.
                </p>
                <p className="text-muted-foreground">
                  You submitted {codingAnswers.filter(a => a.trim().length > 0).length} out of {questions.filter(q => q.type === 'coding').length} coding challenges.
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
                setCodingAnswers([]);
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
                setAnswers(new Array(questions.length).fill(null));
                setCodingAnswers(new Array(questions.filter(q => q.type === 'coding').length).fill(''));
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