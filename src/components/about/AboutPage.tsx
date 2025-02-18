import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Lightbulb, Shield } from "lucide-react";

const AboutPage = () => {
  const features = [
    {
      icon: Users,
      title: "Community-Driven",
      description:
        "Empowering citizens to actively participate in improving government services.",
    },
    {
      icon: Lightbulb,
      title: "Innovative Solutions",
      description:
        "Leveraging community insights to identify and implement efficient solutions.",
    },
    {
      icon: Shield,
      title: "Secure & Anonymous",
      description:
        "Optional anonymous submissions to ensure open and honest feedback.",
    },
  ];

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">About DOGEcuts.org</h1>
          <p className="text-xl text-muted-foreground mb-8">
            A platform dedicated to improving government efficiency through
            community feedback and collaboration.
          </p>
          <Button asChild>
            <Link to="/submit" className="inline-flex items-center">
              Submit Feedback <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Mission Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert">
            <p>
              DOGEcuts.org serves as a bridge between citizens and government,
              facilitating transparent communication and collaborative
              problem-solving. Our platform enables community members to share
              their experiences, suggestions, and concerns about government
              services.
            </p>
            <p>
              By collecting and organizing this valuable feedback, we help
              identify areas for improvement and celebrate successful
              initiatives, creating a more efficient and responsive government
              system.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-card">
              <CardHeader>
                <feature.icon className="h-8 w-8 mb-4 text-primary" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
