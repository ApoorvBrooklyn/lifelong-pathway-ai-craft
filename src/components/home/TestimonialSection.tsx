
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    id: 1,
    quote: "The AI assessment accurately identified my skill gaps for a UX design role, and the learning recommendations helped me land my dream job within 6 months.",
    author: "Sarah Johnson",
    role: "UX Designer at TechCorp",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    id: 2,
    quote: "As someone transitioning from marketing to data analytics, CareerPath AI provided the exact roadmap I needed to build my technical skills efficiently.",
    author: "Michael Chen",
    role: "Data Analyst at MarketFirm",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    id: 3,
    quote: "The career mapping feature helped me visualize my long-term growth in software development and identify the specialized skills I needed to focus on.",
    author: "Priya Patel",
    role: "Senior Developer at InnovateTech",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
  },
];

const TestimonialSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Learn how professionals have accelerated their careers using our AI-powered guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="rounded-full w-20 h-20 object-cover border-4 border-background"
                    />
                  </div>
                  <blockquote className="text-foreground mb-6">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="mt-auto">
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
