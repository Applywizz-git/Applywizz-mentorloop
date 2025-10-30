import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/ui/navbar";
import { ContactModal } from "@/components/ui/contact-modal";
import { Users, Clock, Video, CheckCircle, FileText, Shield, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect,useState } from "react";
import {supabase} from "@/lib/supabase";
import { seedDemoData } from "@/lib/data";
import logo from "@/assets/applywizz-logo.png";
import PageWrapper from "@/components/motion/PageWrapper";
import Reveal from "@/components/motion/Reveal";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

const Landing = () => {
  const [data, setData]= useState("");
  const [mentors, setMentors] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
const normalizeMentorData = (profiles: any[]) => {
  return profiles.map(profile => {
    console.log("📊 Raw profile data for normalization:", profile);
    
    // Use mentor_id for navigation, profile id for display
    const displayId = profile.id;
    const navigationId = profile.mentor_id || profile.id; // Prefer mentor_id for navigation
    
    const name = profile.name || "Industry Mentor";
    const title = profile.title || "Industry Expert";
    
    let experience = 0;
    if (typeof profile.experience === 'string') {
      experience = parseInt(profile.experience) || 0;
    } else {
      experience = profile.experience || 0;
    }
    
    const rating = Number(profile.rating) || 0;
    
    // Handle specialties
    let specialties: string[] = [];
    if (profile.specialties) {
      try {
        if (Array.isArray(profile.specialties)) {
          specialties = profile.specialties;
        } else if (typeof profile.specialties === 'string') {
          let cleanString = profile.specialties
            .replace(/^\["\["/, '["')
            .replace(/\"\]"\]$/, '"]')
            .replace(/\\"/g, '"')
            .replace(/"\[/g, '[')
            .replace(/\]"/g, ']');
          
          try {
            const parsed = JSON.parse(cleanString);
            specialties = Array.isArray(parsed) ? parsed : [profile.specialties];
          } catch {
            specialties = profile.specialties.split(',').map((s: string) => 
              s.replace(/[\[\]"]/g, '').trim()
            ).filter(s => s !== "");
          }
        }
      } catch (e) {
        console.warn("Error parsing specialties:", e);
        specialties = ["Career Guidance"];
      }
    }
    
    if (specialties.length === 0) {
      specialties = [title, "Mentorship"].filter(Boolean);
    }
    
    const company = profile.company || "Industry Expert";
    const avatar = profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F1F3D&color=fff&size=128&bold=true`;
    
    const normalizedMentor = {
      id: displayId, // Use profile id for React keys
      mentor_id: navigationId, // Use mentor_id for navigation
      name: name,
      title: title,
      company: company,
      avatar: avatar,
      experience: experience,
      rating: rating,
      specialties: specialties,
      session_amount: Number(profile.price) || 0,
      reviews: 0,
      availability: "medium",
      languages: ['English'],
      _has_mentor_id: !!profile.mentor_id // For debugging
    };
    
    console.log("🔄 Normalized mentor:", normalizedMentor);
    return normalizedMentor;
  });
};
// Fetch approved mentors for the landing page from profiles table
useEffect(() => {
  const fetchMentors = async () => {
    try {
      setIsLoading(true);
      console.log("🔍 Fetching mentors from PROFILES table...");
      
      // Fetch mentors from profiles table where role is 'mentor'
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          user_id,
          name,
          email,
          role,
          avatar,
          title,
          company,
          experience,
          rating,
          bio,
          verified,
          price,
          specialties,
          timezone,
          created_at,
          updated_at,
          phone,
          is_admin,
          resume_path,
          mentor_id
        `)
        .eq("role", "mentor") // Only get mentors
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) {
        console.error("❌ Error fetching mentors from profiles:", error);
      } else {
        console.log("✅ MENTORS FROM PROFILES TABLE:", data);
        console.log(`🎯 Total mentors found: ${data?.length || 0}`);
        
        if (data && data.length > 0) {
          const normalizedMentors = normalizeMentorData(data);
          console.log("🔄 Normalized mentors:", normalizedMentors);
          setMentors(normalizedMentors);
        } else {
          console.log("⚠️ No mentors found in profiles table");
          setMentors([]);
        }
      }
    } catch (err) {
      console.error("❌ Unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchMentors();
}, []);

  // Rest of your existing code (trustStats, howItWorksSteps, etc.) remains the same...
  const trustStats = [
    { icon: CheckCircle, label: "100% Verified Mentors", color: "text-verified-green" },
    { icon: Users, label: "2,000+ Sessions Completed", color: "text-trust-badge" },
    { icon: CheckCircle, label: "4.9/5 Average Rating", color: "text-yellow-500" }
  ];

  const howItWorksSteps = [
    {
      icon: Users,
      title: "Browse Verified Mentors",
      description: "Explore our curated list of industry professionals, all verified with LinkedIn, resume, and company confirmation.",
      color: "bg-blue-50 text-trust-badge"
    },
    {
      icon: Clock,
      title: "Book a Session",
      description: "Schedule a 45-minute video call at a time that works for both you and your mentor.",
      color: "bg-green-50 text-verified-green"
    },
    {
      icon: Video,
      title: "Get Expert Guidance",
      description: "Receive personalized career advice, resume feedback, and industry insights from experienced professionals.",
      color: "bg-yellow-50 text-yellow-600"
    }
  ];

  const verificationSteps = [
    {
      icon: CheckCircle,
      title: "Email Verification",
      description: "Professional email confirmation"
    },
    {
      icon: FileText,
      title: "LinkedIn Verification", 
      description: "Profile and company validation"
    },
    {
      icon: Shield,
      title: "Resume Review",
      description: "Experience and skills verification"
    },
    {
      icon: Building,
      title: "Company Confirmation",
      description: "Current employment verification"
    }
  ];

  // Helper function to get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "M";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  };

// Helper function to get avatar URL with fallback
const getAvatarUrl = (mentor: any) => {
  // Use the avatar from profile if available
  if (mentor.avatar && mentor.avatar.trim() !== "") {
    return mentor.avatar;
  }
  // Fallback to UI avatars
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=0F1F3D&color=fff&size=128&bold=true`;
};

// Improved image error handler
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, mentor: any) => {
  const target = e.target as HTMLImageElement;
  const name = mentor.name || "Mentor";
  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F1F3D&color=fff&size=128&bold=true`;
};
  return (
    <div className="min-h-screen bg-background">
       
      <Navbar unreadCount={0} />
    
      
{/* Hero Section */}
<section className="aw-container relative py-14 md:py-20 text-center">
  <Reveal dir="up">
    <div className="space-y-5">
      <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
        Supercharge your career with{" "}
        <span className="text-blue-600">Long Term Mentorship</span>
      </h1>
      <p className="max-w-2xl mx-auto text-neutral-600 text-base md:text-lg">
        Take 1:1 long-term mentorship from industry experts and accelerate your journey.
      </p>
    </div>
  </Reveal>

<Reveal dir="right" delay={0.05}>
  <div className="mt-7 flex justify-center gap-3">
    {/* Find Your Mentor */}
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
</Reveal>


  <Reveal dir="up" delay={0.1}>
    <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
      {[
        { icon: "💼", label: "FAANG Mentors" },
        { icon: "⏱", label: "45-min Sessions" },
        { icon: "📈", label: "Career Roadmap" },
        { icon: "🌐", label: "Global Network" },
      ].map((item) => (
        <div
          key={item.label}
          className="aw-card aw-hover aw-press flex flex-col items-center justify-center gap-1 p-4 text-center"
        >
          <div className="text-2xl">{item.icon}</div>
          <div className="text-sm font-medium text-neutral-700">{item.label}</div>
        </div>
      ))}
    </div>
  </Reveal>
</section>
{/* === Dark Stats Section === */}
<section className="relative overflow-hidden bg-gradient-to-b from-[#020617] via-[#030712] to-[#0B1120] py-16 md:py-24 mt-12">
  <div className="aw-container text-center text-white">
    <Reveal dir="up">
      <h2 className="text-2xl md:text-4xl font-semibold mb-4">
        Start Achieving Progress with{" "}
        <span className="text-blue-500">Long Term Mentorship</span>
      </h2>
      <p className="text-neutral-400 max-w-2xl mx-auto text-base md:text-lg">
        See measurable career growth with structured sessions, accountability, and real-world guidance.
      </p>
    </Reveal>

    <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
      {[
        { number: "36%", label: "Secured Offers" },
        { number: "72%", label: "Achieved Career Goals" },
        { number: "4.9/5", label: "Average Mentor Rating" },
      ].map((stat, i) => (
        <Reveal key={stat.label} delay={i * 0.05}>
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-4xl md:text-5xl font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.7)]">
              {stat.number}
            </div>
            <div className="text-neutral-300 text-sm md:text-base">
              {stat.label}
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  </div>

  {/* Decorative gradient glow at bottom */}
  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0B1120] to-transparent" />
</section>
{/* === Mid Content Cards Section === */}
<section className="aw-container py-16 md:py-20">
  <div className="text-center">
    <Reveal dir="up">
      <h2 className="text-2xl md:text-4xl font-semibold mb-4">
        Choose the <span className="text-blue-600">Right Mentorship</span> For You
      </h2>
      <p className="text-neutral-600 max-w-2xl mx-auto text-base md:text-lg">
        Explore categories designed to help you achieve your goals — whether it's landing a new job, growing in your current role, or changing careers.
      </p>
    </Reveal>
  </div>

  <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
    {[
      {
        title: "Job Preparation",
        desc: "Get personalized guidance for resumes, interview practice, and referrals.",
        bg: "bg-[#F9FAFB]",
      },
      {
        title: "Career Growth",
        desc: "Level up your career with senior mentors who’ve been there and done it.",
        bg: "bg-[#FFF7ED]",
      },
      {
        title: "Skill Upskilling",
        desc: "Work with mentors to develop critical technical & soft skills.",
        bg: "bg-[#F5F3FF]",
      },
    ].map((item, i) => (
      <Reveal key={item.title} delay={i * 0.05}>
        <div className={`aw-card aw-hover aw-press p-6 ${item.bg}`}>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            {item.title}
          </h3>
          <p className="text-sm text-neutral-600 mb-4">{item.desc}</p>
          <button className="aw-btn-primary text-sm px-5 py-2 mt-auto">
            Explore →
          </button>
        </div>
      </Reveal>
    ))}
  </div>

<Reveal dir="up" delay={0.15}>
  <div className="mt-10 flex justify-center">
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
  </div>
</Reveal>

</section>
{/* === Testimonials Section === */}
<section className="relative bg-[#F5F3FF] py-16 md:py-20">
  <div className="aw-container text-center">
    <Reveal dir="up">
      <h2 className="text-2xl md:text-4xl font-semibold mb-4">
        Hear from <span className="text-blue-600">Our Mentees</span>
      </h2>
      <p className="text-neutral-600 max-w-2xl mx-auto text-base md:text-lg">
        Real stories from mentees who transformed their careers with personalized guidance.
      </p>
    </Reveal>

    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        {
          name: "Sarah",
          role: "Data Analyst @ Google",
          text: "My mentor helped me structure my interview prep and gave me honest feedback every week. I landed my dream role!",
        },
        {
          name: "Rahul",
          role: "Software Engineer @ Amazon",
          text: "The roadmap we created together made my transition smooth. Weekly accountability was a game-changer.",
        },
        {
          name: "Emily",
          role: "Product Manager @ Microsoft",
          text: "I got clarity on my career direction and real industry insights — something no online course could give me.",
        },
      ].map((t, i) => (
        <Reveal key={t.name} delay={i * 0.05}>
          <div className="aw-card aw-hover aw-press p-6 text-left bg-white">
            <p className="text-sm text-neutral-700 mb-4 leading-relaxed">
              “{t.text}”
            </p>
            <div className="mt-3">
              <div className="font-semibold text-neutral-900">{t.name}</div>
              <div className="text-xs text-neutral-500">{t.role}</div>
            </div>
          </div>
        </Reveal>
      ))}
    </div>

<Reveal dir="up" delay={0.15}>
  <div className="mt-12">
    <button
      onClick={() => navigate("/login")}
      className="aw-btn-primary text-base px-8 py-3"
    >
      Join as a Mentee
    </button>
  </div>
</Reveal>

  </div>
</section>


<section id="how-it-works" className="px-6 py-20 bg-white">
  <div className="max-w-6xl mx-auto">
    {/* Heading */}
    <div className="text-center mb-14">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        How <span className="text-blue-600">ApplyWizz</span> Works
      </h2>
      <p className="text-neutral-600 max-w-2xl mx-auto text-base md:text-lg">
        Simple, secure, and effective mentorship in three easy steps
      </p>
    </div>

    {/* Steps */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
      {howItWorksSteps.map((step, index) => {
        const bgColors = ["bg-blue-50", "bg-emerald-50", "bg-amber-50"];
        const iconColors = ["text-blue-600", "text-emerald-600", "text-amber-600"];
        const bg = bgColors[index % bgColors.length];
        const icon = iconColors[index % iconColors.length];

        return (
          <Reveal key={index} delay={index * 0.05}>
            <div
              className={`h-full flex flex-col justify-between text-center p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 ${bg}`}
            >
              {/* Icon */}
              <div className={`w-16 h-16 mx-auto mb-5 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-inner`}>
                <step.icon className={`w-8 h-8 ${icon}`} />
              </div>

              {/* Content */}
              <div className="flex-grow flex flex-col justify-center">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  </div>
</section>


<section className="px-6 py-20 bg-[#F9FBFF]">
  <div className="max-w-6xl mx-auto text-center mb-12">
    <Reveal dir="up">
      <h2 className="text-4xl font-bold mb-4 text-foreground">
        Meet Our Verified Mentors
      </h2>
      <p className="text-xl text-muted-foreground">
        Industry leaders ready to help you advance your career
      </p>
    </Reveal>
  </div>

  {!isLoading && mentors.length > 0 ? (
    <Swiper
      modules={[Autoplay]}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      loop={mentors.length > 1}
      slidesPerView={1}
      spaceBetween={20}
      breakpoints={{
        640: { slidesPerView: mentors.length >= 2 ? 2 : 1 },
        1024: { slidesPerView: mentors.length >= 3 ? 3 : mentors.length >= 2 ? 2 : 1 }
      }}
      className="max-w-6xl mx-auto"
    >
      {mentors.map((mentor, index) => (
        <SwiperSlide key={mentor.id}>
          <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between h-full">
            {/* Rating */}
            <div className="absolute top-4 right-4 flex items-center text-yellow-500 font-semibold">
              <span className="mr-1">⭐</span>  
              {mentor.rating > 0 ? mentor.rating.toFixed(1) : "New"}
            </div>

            {/* Avatar & Info */}
            <div className="flex items-center mb-4">
              <img
                src={getAvatarUrl(mentor)}
                alt={mentor.name}
                className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-gray-100"
                onError={(e) => handleImageError(e, mentor)}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-foreground truncate">
                  {mentor.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {mentor.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {mentor.experience} Years of Experience
                </p>
              </div>
            </div>

            {/* Company */}
            <p className="text-sm text-muted-foreground mb-4 truncate">
              {mentor.company}
            </p>

            {/* Specialties */}
            {mentor.specialties && mentor.specialties.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {mentor.specialties.slice(0, 3).map((specialty: string, idx: number) => (
                    <span 
                      key={idx}
                      className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 truncate max-w-[120px]"
                      title={specialty}
                    >
                      {specialty.length > 15 ? specialty.substring(0, 15) + '...' : specialty}
                    </span>
                  ))}
                  {mentor.specialties.length > 3 && (
                    <span 
                      className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-600"
                      title={mentor.specialties.slice(3).join(', ')}
                    >
                      +{mentor.specialties.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Reviews count if available */}
            {mentor.reviews > 0 && (
              <div className="text-xs text-gray-500 mb-2">
                {mentor.reviews} review{mentor.reviews !== 1 ? 's' : ''}
              </div>
            )}

          {/* CTA */}
<button
  onClick={() => {
    // Use mentor_id for navigation if available
    const mentorId = mentor.mentor_id || mentor.id;
    console.log("🔗 Navigating to mentor:", { 
      profileId: mentor.id, 
      mentorId: mentor.mentor_id,
      navigatingTo: mentorId 
    });
    navigate(`/mentor/${mentorId}`);
  }}
  className="w-full bg-black text-white text-sm font-medium rounded-md py-2 mt-auto hover:bg-black/90 transition-colors duration-200"
>
  View Profile →
</button>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  ) : isLoading ? (
    // Loading state
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div key={item} className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mt-1"></div>
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    // Empty state
    <div className="max-w-6xl mx-auto text-center py-12">
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <p className="text-muted-foreground text-lg mb-4">
          No mentors available at the moment.
        </p>
        <p className="text-sm text-gray-500">
          Check back soon or browse our mentor categories.
        </p>
      </div>
    </div>
  )}

  <Reveal dir="up" delay={0.15}>
    <div className="text-center mt-10">
      <button
        onClick={() => navigate("/mentors")}
        className="relative overflow-hidden aw-btn-primary text-base px-8 py-3 group"
      >
        <span className="absolute inset-0 overflow-hidden">
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine"></span>
        </span>
        <span className="relative inline-flex items-center gap-2">
          View All Mentors
          <span className="inline-block transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:translate-x-2">
            →
          </span>
        </span>
      </button>
    </div>
  </Reveal>
</section>

{/* Domain / Industry Grid Section */}
<section className="px-6 py-15 bg-white">
  <div className="max-w-6xl mx-auto text-center mb-12">
    <h2 className="text-4xl font-bold mb-4 text-foreground">
      Every Domain Every Industry Covered
    </h2>
    <p className="text-xl text-muted-foreground">
      Our mentors are equipped to guide you in any field you're passionate about
    </p>
  </div>

  <div className="max-w-6xl mx-auto border border-gray-200 rounded-xl overflow-hidden">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
      {[
        { icon: "💻", title: "Frontend Developer", mentors: "27+" },
        { icon: "🧠", title: "Backend Developer", mentors: "120+" },
        { icon: "🧰", title: "Fullstack Developer", mentors: "86+" },
        { icon: "⚙️", title: "DevOps / SRE", mentors: "22+" },
        { icon: "📊", title: "Data Analyst", mentors: "17+" },
        { icon: "🧪", title: "Data Scientist", mentors: "48+" },
        { icon: "⚡", title: "Data Engineer", mentors: "21+" },
        { icon: "🤖", title: "AI / ML", mentors: "48+" },
        { icon: "📈", title: "Marketing", mentors: "13+" },
        { icon: "💼", title: "Sales", mentors: "10+" },
        { icon: "📋", title: "Business Analyst", mentors: "27+" },
        { icon: "💰", title: "Finance", mentors: "6+" },
        { icon: "📦", title: "Product Manager", mentors: "32+" },
        { icon: "🎨", title: "UI/UX Designer", mentors: "4+" },
        { icon: "👔", title: "Project Manager", mentors: "11+" },
        { icon: "🧭", title: "Program Manager", mentors: "11+" },
      ].map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-start gap-2 border border-gray-200 p-5 hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 text-2xl">
            {item.icon}
          </div>
          <div className="mt-1 text-left">
            <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
            <p className="text-sm text-muted-foreground">
              Browse {item.mentors} Mentors
            </p>
          </div>
        </div>
        
      ))}
    </div>
  </div>
</section>

{/* === Trust & Safety Section === */}
<section className="relative overflow-hidden bg-gradient-to-b from-[#020617] via-[#030712] to-[#0B1120] py-20 md:py-24 mt-16">
  <div className="aw-container text-center text-white">
    <Reveal dir="up">
      <h2 className="text-2xl md:text-4xl font-semibold mb-4">
        Trust & <span className="text-blue-500">Safety First</span>
      </h2>
      <p className="text-neutral-400 max-w-2xl mx-auto text-base md:text-lg">
        Every mentor goes through our rigorous verification process
      </p>
    </Reveal>

    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
      {verificationSteps.map((step, index) => (
        <Reveal key={step.title} delay={index * 0.05}>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-4">
              <step.icon className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-white mb-2">{step.title}</h3>
            <p className="text-neutral-400 text-sm">{step.description}</p>
          </div>
        </Reveal>
      ))}
    </div>
  </div>

  {/* Decorative bottom glow */}
  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0B1120] to-transparent" />
</section>


{/* === CTA Section === */}
<section className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-20">
  <div className="aw-container text-center">
    <Reveal dir="up">
      <h2 className="text-2xl md:text-4xl font-semibold mb-4">
        Ready to Accelerate Your Career?
      </h2>
      <p className="text-white/90 max-w-2xl mx-auto mb-8 text-base md:text-lg">
        Join thousands of professionals who've advanced their careers with ApplyWizz mentors
      </p>
    </Reveal>

    <Reveal dir="up" delay={0.1}>
<button
  onClick={() => navigate("/mentors")}
  className="relative overflow-hidden bg-white text-black text-base px-8 py-3 rounded-full group 
             shadow-[0_6px_0_0_rgba(0,0,0,0.9)] transition-all duration-300 
             hover:translate-y-[2px] hover:shadow-[0_3px_0_0_rgba(0,0,0,0.9)]"
>
  {/* Stronger shiny sweep */}
  <span className="absolute inset-0 overflow-hidden rounded-full">
    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/50 to-transparent animate-shine"></span>
  </span>

  <span className="relative inline-flex items-center gap-2 font-medium">
    Get Started Now
    <span
  className="inline-block transform transition-transform duration-300 ease-&lsqb;cubic-bezier(0.25,0.1,0.25,1)&rsqb; group-hover:translate-x-2"
>
  →
</span>

  </span>
</button>

    </Reveal>
  </div>
</section>


 {/* === Footer Section === */}
<footer className="bg-[#0B1120] text-white pt-14 pb-10 border-t border-white/10">
  <div className="aw-container">
    <div className="grid md:grid-cols-4 gap-10">
      {/* Logo + Description */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <img src={logo} alt="ApplyWizz" className="h-8 w-auto" />
          <span className="font-bold text-white">APPLY WIZZ</span>
        </div>
        <p className="text-neutral-400 text-sm leading-relaxed">
          Connecting ambitious professionals with verified industry mentors.
        </p>
      </div>

      {/* Platform Links */}
      <div>
        <h4 className="font-semibold mb-4">Platform</h4>
        <ul className="space-y-2 text-neutral-400 text-sm">
          <li>
            <a href="/mentors" className="transition-colors hover:text-blue-400">Find Mentors</a>
          </li>
          <li>
            <a href="/become-mentor" className="transition-colors hover:text-blue-400">Become a Mentor</a>
          </li>
          <li>
            <a href="/how-it-works" className="transition-colors hover:text-blue-400">How it Works</a>
          </li>
        </ul>
      </div>

      {/* Support */}
      <div>
        <h4 className="font-semibold mb-4">Support</h4>
        <ul className="space-y-2 text-neutral-400 text-sm">
          <li>
            <ContactModal>
              <button className="transition-colors hover:text-blue-400">
                Contact Us
              </button>
            </ContactModal>
          </li>
          <li>
            <a href="#" className="transition-colors hover:text-blue-400">Safety</a>
          </li>
        </ul>
      </div>

      {/* Legal */}
      <div>
        <h4 className="font-semibold mb-4">Legal</h4>
        <ul className="space-y-2 text-neutral-400 text-sm">
          <li>
            <a href="/privacy-policy" className="transition-colors hover:text-blue-400">Privacy Policy</a>
          </li>
          <li>
            <a href="/terms-of-service" className="transition-colors hover:text-blue-400">Terms of Service</a>
          </li>
        </ul>
      </div>
    </div>

    <div className="border-t border-white/10 mt-10 pt-6 text-center text-neutral-500 text-sm">
      <p>© 2024 ApplyWizz. All rights reserved.</p>
    </div>
  </div>
</footer>

    </div>
  );
};

export default Landing;
