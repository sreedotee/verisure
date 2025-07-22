import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Factory, Users, BarChart3, ArrowRight, Shield, QrCode } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Shield,
      title: "Admin Control",
      description: "Comprehensive product management and authenticity oversight",
      link: "/admin",
      color: "text-primary"
    },
    {
      icon: Factory,
      title: "Manufacturer Portal",
      description: "Register new products and generate QR authentication codes",
      link: "/manufacturer",
      color: "text-accent"
    },
    {
      icon: Users,
      title: "Customer Verification",
      description: "Instant QR code scanning for product authenticity verification",
      link: "/customer",
      color: "text-success"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Real-time insights into authenticity trends and system performance",
      link: "/analytics",
      color: "text-warning"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-primary/10 p-4 rounded-2xl">
                <ShieldCheck className="h-16 w-16 text-primary" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-foreground mb-6">
              AuthentiCore
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Advanced product authentication system powered by QR technology. 
              Protect your brand, verify authenticity, and build consumer trust with enterprise-grade security.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/customer">
                <Button size="lg" className="bg-primary">
                  <QrCode className="h-5 w-5 mr-2" />
                  Verify Product
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              
              <Link to="/admin">
                <Button variant="outline" size="lg">
                  <Shield className="h-5 w-5 mr-2" />
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Complete Authentication Ecosystem
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From product registration to consumer verification, our platform provides 
            end-to-end authenticity management for brands and customers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="group hover:shadow-lg transition-all duration-300 border hover:border-primary/20">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-card p-3 rounded-xl group-hover:bg-primary/5 transition-colors">
                      <Icon className={`h-8 w-8 ${feature.color}`} />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-6">
                    {feature.description}
                  </p>
                  <Link to={feature.link}>
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Access Portal
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-success mb-2">99.7%</div>
              <div className="text-muted-foreground">Authentication Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1M+</div>
              <div className="text-muted-foreground">Products Verified</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">500+</div>
              <div className="text-muted-foreground">Brand Partners</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
