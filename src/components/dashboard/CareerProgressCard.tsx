
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CareerProgressCardProps {
  title: string;
  currentLevel: string;
  nextLevel: string;
  progress: number;
  skillsNeeded: string[];
}

const CareerProgressCard = ({ 
  title, 
  currentLevel, 
  nextLevel, 
  progress, 
  skillsNeeded 
}: CareerProgressCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">{currentLevel}</span>
            <span className="text-sm font-medium">{nextLevel}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="mt-1 text-right text-xs text-muted-foreground">{progress}% Complete</div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Skills to develop:</h4>
          <div className="flex flex-wrap gap-2">
            {skillsNeeded.map((skill, index) => (
              <span 
                key={index} 
                className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CareerProgressCard;
