// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Navbar } from "@/components/ui/navbar";
// import { getCurrentUser, setCurrentUser } from "@/lib/data";
// import { User } from "@/lib/types";
// import { toast } from "@/hooks/use-toast";
// import { useNavigate } from "react-router-dom";

// const Profile = () => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState<User | null>(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     title: '',
//     company: '',
//     experience: 0
//   });

//   useEffect(() => {
//     const currentUser = getCurrentUser();
//     if (!currentUser) {
//       navigate('/login');
//       return;
//     }
    
//     setUser(currentUser);
//     setFormData({
//       name: currentUser.name,
//       title: currentUser.title || '',
//       company: currentUser.company || '',
//       experience: currentUser.experience || 0
//     });
//   }, [navigate]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!user) return;

//     const updatedUser: User = {
//       ...user,
//       ...formData
//     };

//     setCurrentUser(updatedUser);
//     setUser(updatedUser);
    
//     toast({
//       title: "Profile Updated",
//       description: "Your profile has been successfully updated.",
//     });
//   };

//   if (!user) return null;

//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar />
      
//       <div className="max-w-2xl mx-auto p-6">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold mb-2">Profile Information</h1>
//           <p className="text-muted-foreground">Update your personal and professional information</p>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle>Personal Information</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="flex items-center gap-6">
//                 <Avatar className="w-20 h-20">
//                   <AvatarImage src={user.avatar} />
//                   <AvatarFallback className="text-xl">
//                     {user.name.charAt(0)}
//                   </AvatarFallback>
//                 </Avatar>
//                 <div>
//                   <h3 className="font-semibold">{user.name}</h3>
//                   <p className="text-sm text-muted-foreground">{user.email}</p>
//                   <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
//                   {user.rating && (
//                     <div className="flex items-center gap-1 text-sm">
//                       <span>⭐</span>
//                       <span>{user.rating}/5.0</span>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="name">Full Name</Label>
//                   <Input
//                     id="name"
//                     value={formData.name}
//                     onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
//                     placeholder="Your full name"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="title">Job Title</Label>
//                   <Input
//                     id="title"
//                     value={formData.title}
//                     onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
//                     placeholder="e.g. Senior Product Manager"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="company">Company</Label>
//                   <Input
//                     id="company"
//                     value={formData.company}
//                     onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
//                     placeholder="e.g. Meta"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="experience">Experience (years)</Label>
//                   <Input
//                     id="experience"
//                     type="number"
//                     value={formData.experience}
//                     onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
//                     placeholder="Years of experience"
//                     min="0"
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end gap-4">
//                 <Button type="button" variant="outline" onClick={() => navigate(-1)}>
//                   Cancel
//                 </Button>
//                 <Button type="submit">
//                   Save Changes
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };
 
// export default Profile;    

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Navbar } from "@/components/ui/navbar";
import { getCurrentUser, setCurrentUser } from "@/lib/data";
import { User } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

// Function to upload the resume to Supabase storage
const uploadResume = async (file: File, userId: string) => {
  const { data, error } = await supabase.storage
    .from("resumes")
    .upload(`${userId}/${file.name}`, file);
  if (error) {
    throw error;
  }
  return data?.path; // Return the path to the uploaded resume
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    company: "",
    experience: 0,
    specialties: "",
    resume: null as File | null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const currentUser = getCurrentUser();
      if (!currentUser || currentUser.id === "anon") {
        navigate("/login");
        return;
      }

      setUser(currentUser);

      // Load latest profile fields from DB
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("name, title, company, experience, email, avatar, role, specialties, resume_path")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (error) {
        // Fall back to cached User values (name) and blanks for the rest
        setFormData({
          name: currentUser.name,
          title: "",
          company: "",
          experience: 0,
          specialties: "",
          resume: null,
        });
      } else {
        setFormData({
          name: profile?.name ?? currentUser.name,
          title: profile?.title ?? "",
          company: profile?.company ?? "",
          experience:
            typeof profile?.experience === "number" ? profile.experience : 0,
          specialties: profile?.specialties ?? "",
          resume: profile?.resume_path ? profile?.resume_path : null,
        });

        // Keep cached User in sync for fields that exist on User
        const mergedUser: User = {
          id: currentUser.id,
          email: currentUser.email,
          role: (profile?.role as User["role"]) ?? currentUser.role,
          name: profile?.name ?? currentUser.name,
          avatar: profile?.avatar ?? currentUser.avatar,
        };
        setCurrentUser(mergedUser);
        setUser(mergedUser);
      }

      setLoading(false);
    })();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Upload resume first if it exists
      let resumePath = null;
      if (formData.resume) {
        resumePath = await uploadResume(formData.resume, user.id);
      }

      // Update Supabase profile row with specialties and resume
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name.trim(),
          title: formData.title.trim(),
          company: formData.company.trim(),
          experience: Number.isFinite(formData.experience)
            ? formData.experience
            : 0,
          specialties: formData.specialties.split(",").map(item => item.trim()),  // Convert specialties into an array
          resume_path: resumePath,  // Store resume path in the database
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // Update cached User only with fields that exist on User
      const updatedUser: User = {
        id: user.id,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        name: formData.name.trim(),
      };
      setCurrentUser(updatedUser);
      setUser(updatedUser);

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user || loading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar unreadCount={0}/>

      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Information</h1>
          <p className="text-muted-foreground">
            Update your personal and professional information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xl">
                    {user.name?.charAt(0) ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {user.role}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="e.g. Senior Product Manager"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        company: e.target.value,
                      }))
                    }
                    placeholder="e.g. Meta"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        experience: parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="Years of experience"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialties">Specialties</Label>
                  <Input
                    id="specialties"
                    value={formData.specialties}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        specialties: e.target.value,
                      }))
                    }
                    placeholder="Enter specialties (comma separated)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume">Resume</Label>
                  <Input
                    id="resume"
                    type="file"
                    onChange={(e) => setFormData((prev) => ({ ...prev, resume: e.target.files ? e.target.files[0] : null }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
