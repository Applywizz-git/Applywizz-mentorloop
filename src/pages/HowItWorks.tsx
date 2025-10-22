import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/ui/navbar";
import { Users, Clock, Video, CheckCircle, FileText, Shield, Building, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Users,
      title: "Browse Verified Mentors",
      description: "Explore our curated list of industry professionals. All mentors are verified through our rigorous process including LinkedIn verification, resume review, and company confirmation.",
      color: "bg-blue-50 text-trust-badge"
    },
    {
      icon: Clock,
      title: "Book a Session", 
      description: "Choose from available time slots and schedule a 45-minute video call at a time that works for both you and your mentor. Our booking system ensures seamless scheduling.",
      color: "bg-green-50 text-verified-green"
    },
    {
      icon: Video,
      title: "Get Expert Guidance",
      description: "Connect via video call to receive personalized career advice, resume feedback, interview preparation, and industry insights from experienced professionals.",
      color: "bg-yellow-50 text-yellow-600"
    }
  ];

  const verificationProcess = [
    {
      icon: CheckCircle,
      title: "Email Verification",
      description: "Professional email confirmation and identity validation"
    },
    {
      icon: FileText,
      title: "LinkedIn Verification", 
      description: "Profile authenticity and company validation"
    },
    {
      icon: Shield,
      title: "Resume Review",
      description: "Experience verification and skills assessment"
    },
    {
      icon: Building,
      title: "Company Confirmation",
      description: "Current employment and role verification"
    }
  ];

  const benefits = [
    "1-on-1 personalized guidance",
    "Industry-specific expertise",
    "Flexible scheduling",
    "Verified professional mentors",
    "Career advancement strategies",
    "Resume and portfolio reviews",
    "Interview preparation",
    "Networking opportunities"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar unreadCount={0} />
      
      {/* Hero Section */}
      <section className="px-6 py-16 text-center bg-gradient-to-b from-blue-50 to-background">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 text-foreground">
            How <span className="text-trust-badge">ApplyWizz</span> Works
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with verified industry experts in three simple steps. Get personalized career guidance from professionals at top companies.
          </p>
    <button
      onClick={() => navigate("/mentors")}
      className="relative overflow-hidden aw-btn-primary text-base px-8 py-3 group"
    >
      {/* Continuous shiny sweep animation */}
      <span className="absolute inset-0 overflow-hidden">
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine"></span>
      </span>

      <span className="relative inline-flex items-center gap-2">
        Get Started Now
        <span
  className="inline-block transform transition-transform duration-300 ease-&lsqb;cubic-bezier(0.25,0.1,0.25,1)&rsqb; group-hover:translate-x-2"
>
  →
</span>

      </span>
    </button>
        </div>
      </section>

      {/* Main Steps */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Three Simple Steps</h2>
            <p className="text-xl text-muted-foreground">From discovery to mentorship in minutes</p>
          </div>
          
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="grid md:grid-cols-2 gap-12 items-center">
                <div className={index % 2 === 1 ? "md:order-2" : ""}>
                  <Card className="p-8 border-0 shadow-card">
                    <CardContent className="p-0">
                      <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center mb-6`}>
                        <step.icon className="w-8 h-8" />
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-3xl font-bold text-trust-badge">{index + 1}</span>
                        <h3 className="text-2xl font-semibold text-foreground">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground text-lg leading-relaxed">{step.description}</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className={index % 2 === 1 ? "md:order-1" : ""}>
                 <div className="aspect-video rounded-2xl overflow-hidden">
  {index === 0 && (
    <img
      src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=800&q=80"
      alt="Browse Mentors"
      className="w-full h-full object-cover"
    />
  )}
  {index === 1 && (
    <img
      src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80"
      alt="Book a Session"
      className="w-full h-full object-cover"
    />
  )}
  {index === 2 && (
    <img
      src="https://images.unsplash.com/photo-1607746882042-944635dfe10?auto=format&fit=crop&w=800&q=80"
      alt="Get Expert Guidance"
      className="w-full h-full object-cover"
    />
  )}
</div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Trust & Safety First</h2>
            <p className="text-xl text-muted-foreground">Every mentor goes through our rigorous verification process</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {verificationProcess.map((step, index) => (
              <Card key={index} className="text-center p-6 border-0 shadow-card">
                <CardContent className="p-0">
                  <div className="w-16 h-16 rounded-full bg-verified-green/20 text-verified-green flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-foreground">What You Get</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Comprehensive mentorship designed to accelerate your career growth
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-verified-green flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="p-8 border-0 shadow-card">
              <CardContent className="p-0 text-center">
                <div className="w-16 h-16 rounded-full bg-trust-badge/20 text-trust-badge flex items-center justify-center mx-auto mb-6">
                  <Video className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-foreground">45-Minute Sessions</h3>
                <p className="text-muted-foreground mb-6">
                  Dedicated time for deep-dive discussions about your career goals, challenges, and next steps.
                </p>
                <Button 
                  onClick={() => navigate('/mentors')}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Find Your Mentor
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 bg-gradient-to-r from-trust-badge to-verified-green text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of professionals who've advanced their careers with ApplyWizz
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
      onClick={() => navigate("/mentors")}
      className="relative overflow-hidden aw-btn-primary text-base px-8 py-3 group"
    >
      {/* Continuous shiny sweep animation */}
      <span className="absolute inset-0 overflow-hidden">
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine"></span>
      </span>

      <span className="relative inline-flex items-center gap-2">
        Find Your Mentor
       <span
  className="inline-block transform transition-transform duration-300 ease-&lsqb;cubic-bezier(0.25,0.1,0.25,1)&rsqb; group-hover:translate-x-2"
>
  →
</span>

      </span>
    </button>
             <button
      onClick={() => navigate("/become-mentor")}
      className="aw-btn-secondary text-base px-8 py-3"
    >
      Become a Mentor
    </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;