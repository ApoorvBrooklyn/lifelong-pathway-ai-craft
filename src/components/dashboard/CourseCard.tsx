
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  title: string;
  provider: string;
  duration: string;
  level: string;
  image: string;
  url: string;
  match: number;
}

const CourseCard = ({ 
  title, 
  provider, 
  duration, 
  level, 
  image, 
  url, 
  match 
}: CourseCardProps) => {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative">
        <img 
          src={image} 
          alt={title} 
          className="h-40 w-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className="bg-primary/90 text-white rounded-full px-2 py-1 text-xs font-medium">
            {match}% Match
          </span>
        </div>
      </div>
      <CardContent className="pt-4 flex-grow">
        <h3 className="font-semibold mb-2 line-clamp-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{provider}</p>
        <div className="flex gap-2 mt-3">
          <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
            {duration}
          </span>
          <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
            {level}
          </span>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild variant="outline" className="w-full">
          <a href={url} target="_blank" rel="noopener noreferrer">View Course</a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
