import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/providers/SessionProvider";
import { 
  Sparkles, 
  Send, 
  User, 
  Bot, 
  Upload, 
  FileText, 
  Trash2,
  Menu,
  Plus,
  Settings,
  HelpCircle
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Suggestion {
  id: string;
  text: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
}

const LearnWithAI = () => {
  const { user } = useSession();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi ${user?.user_metadata?.name || 'there'}! I'm your AI learning assistant. How can I help you today? You can ask me about:
      
• Learning paths for specific skills or careers
• Recommendations for topics to study
• Career guidance and advice
• Explanations of complex topics
• Resources for further learning
• Upload PDFs to chat about their content`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const suggestions: Suggestion[] = [
    { id: '1', text: 'What skills should I learn to become a data scientist?' },
    { id: '2', text: 'Create a learning roadmap for web development' },
    { id: '3', text: 'What are the latest trends in artificial intelligence?' },
    { id: '4', text: 'How do I transition from marketing to UX design?' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create a simulated progress effect
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check if the file is a PDF
        if (file.type !== 'application/pdf') {
          toast({
            title: "Invalid file type",
            description: "Only PDF files are supported",
            variant: "destructive",
          });
          continue;
        }
        
        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        
        // Upload the file to the backend
        const response = await fetch('/api/learn-with-ai/upload-pdf', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Add the file to the list of uploaded files
        setUploadedFiles(prev => [...prev, {
          id: data.fileId || Date.now().toString(),
          name: file.name,
          size: file.size,
          type: file.type,
          content: data.text || '',
        }]);
        
        // Add a message indicating the file was uploaded
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `I've processed "${file.name}". You can now ask me questions about its content!`,
          timestamp: new Date()
        }]);
      }
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    
    toast({
      title: "File Removed",
      description: "The file has been removed from the conversation.",
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowSuggestions(false);
    
    try {
      // Prepare file contexts to include with the message
      const fileContexts = uploadedFiles.map(file => ({
        id: file.id,
        name: file.name,
        content: file.content
      }));
      
      // Send the message to the backend API
      const response = await fetch('/api/learn-with-ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          files: fileContexts,
          userId: user?.id || 'anonymous',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(data.timestamp) || new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Handle markdown-style formatting
    const formattedContent = content
      .split('\n')
      .map((line, index) => {
        // Format bullet points with proper indentation
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          return <p key={index} className="ml-4 mb-1">{line}</p>;
        }
        
        // Format headings (simple version)
        if (line.trim().startsWith('#')) {
          const level = line.trim().match(/^#+/)?.[0].length || 1;
          const text = line.trim().replace(/^#+\s*/, '');
          
          if (level === 1) return <h3 key={index} className="text-lg font-bold mt-2 mb-1">{text}</h3>;
          if (level === 2) return <h4 key={index} className="text-md font-semibold mt-2 mb-1">{text}</h4>;
          return <h5 key={index} className="font-medium mt-1 mb-1">{text}</h5>;
        }
        
        // Regular paragraph with proper spacing
        return <p key={index} className={line.trim() === '' ? 'h-2' : 'mb-1'}>{line}</p>;
      });
      
    return <div className="space-y-1">{formattedContent}</div>;
  };

  const getFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const startNewChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: `Hi ${user?.user_metadata?.name || 'there'}! I'm your AI learning assistant. How can I help you today?`,
        timestamp: new Date()
      }
    ]);
    setUploadedFiles([]);
    setShowSuggestions(true);
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] mt-20 mb-0 overflow-hidden bg-background">
      {/* Left sidebar - mobile menu */}
      <div className="fixed bottom-24 left-4 z-50 md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full shadow-md">
              <Menu size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem onClick={startNewChat} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              <span>New Chat</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => fileInputRef.current?.click()} 
              className="cursor-pointer"
            >
              <Upload className="mr-2 h-4 w-4" />
              <span>Upload PDF</span>
            </DropdownMenuItem>
            {uploadedFiles.length > 0 && (
              <DropdownMenuLabel>Uploaded PDFs</DropdownMenuLabel>
            )}
            {uploadedFiles.map(file => (
              <DropdownMenuItem key={file.id} className="flex items-center justify-between">
                <div className="flex items-center truncate max-w-[150px]">
                  <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(file.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Left sidebar - desktop */}
      <div className="hidden md:flex w-64 border-r border-border flex-col h-full p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 text-primary mr-2" />
            <h2 className="font-semibold text-lg">Learn With AI</h2>
          </div>
        </div>
        
        <Button onClick={startNewChat} variant="outline" className="w-full mb-4 justify-start">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
        
        <Separator className="mb-4" />
        
        <div className="space-y-1 mb-4">
          <h3 className="text-sm font-medium mb-2">My Documents</h3>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sm h-9"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload PDF
          </Button>
        </div>
        
        {uploadedFiles.length > 0 && (
          <div className="flex-1 overflow-auto">
            <div className="space-y-1">
              {uploadedFiles.map(file => (
                <div 
                  key={file.id} 
                  className="flex items-center justify-between p-2 text-sm rounded-md hover:bg-muted transition-colors"
                >
                  <div className="flex items-center truncate flex-1">
                    <FileText className="mr-2 h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-50 hover:opacity-100"
                    onClick={() => handleDeleteFile(file.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-auto">
          <Separator className="mb-4" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-4 w-4" />
            </Button>
            <span className="text-xs">Educational AI Assistant</span>
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full w-full md:ml-64 md:w-[calc(100%-16rem)] relative overflow-hidden">
        {/* Hidden file input */}
        <input 
          ref={fileInputRef}
          type="file" 
          accept="application/pdf" 
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Chat header */}
        <div className="border-b border-border p-4 flex items-center justify-between">
          <h1 className="font-semibold flex items-center">
            <Bot className="mr-2 h-5 w-5 text-primary" />
            AI Learning Assistant
          </h1>
          
          {uploadedFiles.length > 0 && (
            <div className="flex items-center">
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                <span>{uploadedFiles.length} document{uploadedFiles.length !== 1 ? 's' : ''}</span>
              </Badge>
            </div>
          )}
        </div>

        {/* Upload progress indicator */}
        {isUploading && (
          <div className="absolute top-16 left-0 right-0 z-10">
            <Progress value={uploadProgress} className="h-1 rounded-none" />
          </div>
        )}
        
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-28" style={{ scrollbarWidth: 'thin' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'assistant' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div className={`flex gap-3 max-w-3xl ${
                message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {message.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={`px-4 py-3 rounded-lg shadow-sm ${
                  message.role === 'assistant' 
                    ? 'bg-muted' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  <div className="message-content">
                    {formatMessage(message.content)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-3xl">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                  <Bot size={16} />
                </div>
                <div className="px-4 py-3 rounded-lg bg-muted">
                  <div className="flex space-x-2 items-center h-5">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Suggestions */}
          {showSuggestions && messages.length === 1 && (
            <div className="py-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 ml-11">Suggested questions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-11">
                {suggestions.map(suggestion => (
                  <Button
                    key={suggestion.id}
                    variant="outline"
                    className="justify-start h-auto py-3 px-4 text-left"
                    onClick={() => handleSuggestionClick(suggestion.text)}
                  >
                    {suggestion.text}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <div className="absolute bottom-1 left-0 right-0 p-4 bg-background border-t border-border z-10">
          <div className="flex gap-2 items-end max-w-3xl mx-auto">
            <div className="relative flex-grow">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask a question about education or career development..."
                className="pr-12 resize-none min-h-[56px] max-h-28"
                rows={1}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="ghost" 
                      className="absolute right-2 top-2 h-8 w-8"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload PDF</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !inputValue.trim()}
              className="h-10 w-10 rounded-full p-0"
              aria-label="Send message"
            >
              <Send size={16} className="ml-0.5" />
            </Button>
          </div>
          <div className="text-xs text-center text-muted-foreground mt-1 max-w-3xl mx-auto">
            AI learning assistant for educational and career guidance only
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnWithAI; 