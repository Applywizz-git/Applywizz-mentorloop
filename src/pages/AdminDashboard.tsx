
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Calendar, CheckCircle, Clock, Eye, Check, X, User as UserIcon, KeyRound, LogOut, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getAdminStats,
  listMentors,
  listBookings,
  getCurrentUser,
  logout,
  upsertMentorProfile,
  approveMentor,
  rejectMentor,
} from "@/lib/data";
import { AdminStats, Mentor, Booking } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

// dropdown + dialog
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ✅ use supabase directly
import { supabase } from "@/lib/supabase";

const AdminDashboard = () => {
  const navigate = useNavigate();
  // ✅ make user reference stable
  const user = useMemo(() => getCurrentUser(), []);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // ✅ NEW: pending mentor APPLICATIONS (from mentors table joined with profiles)
  const [pendingApps, setPendingApps] = useState<any[]>([]);

  // Eye dialog state
  const [viewOpen, setViewOpen] = useState(false);
  const [viewMentor, setViewMentor] = useState<Mentor | null>(null);

  // Add-mentor dialog state (extended)
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [addExperience, setAddExperience] = useState<number | string>("");
  const [addSpecialties, setAddSpecialties] = useState("");
  const [addAvatar, setAddAvatar] = useState("");
  // ✅ NEW fields
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addResumeFile, setAddResumeFile] = useState<File | null>(null);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [earningsRows, setEarningsRows] = useState<any[]>([]);

  // ✅ guard so data load runs once
  const hasLoadedRef = useRef(false);
useEffect(() => {
  if (hasLoadedRef.current) return;
  hasLoadedRef.current = true;

  if (!user || user.role !== "admin") {
    navigate("/login");
    return;
  }

  (async () => {
    try {
      const [s, ms, bs, bankData] = await Promise.all([
        getAdminStats(),
        listMentors(),
        listBookings({}),
        supabase
          .from("mentor_bank_details")
          .select(`
            id,
            mentor_id,
            bank_name,
            branch,
            account_number,
            ifsc_code,
            status,
            payment_proof_path,
            mentors:mentor_id (
              id,
              applicant_name,
               amount
            )
          `)
          .order("created_at", { ascending: false })
      ]);

      setStats(s);
      setMentors(ms);
      setBookings(bs);
      setTimeout(() => {
  console.log("🔍 DEBUG - Final mentor bookings data:");
  ms.forEach(mentor => {
    const bookingCount = mentor.bookings?.length || 0;
    const calculatedAmount = (mentor.bookings ?? []).reduce((sum, b) => sum + (b.session_amount ?? 0), 0);
    console.log(`Mentor ${mentor.name}: ${bookingCount} bookings, amount: ${calculatedAmount}`);
  });
}, 100);

      if (bankData.error) throw bankData.error;
// Create one row per booking
const earningsRows = bs
  .filter(b => b.status !== "cancelled")
  .map((booking) => {
    const mentor = ms.find(m => m.id === booking.mentorId);
    const perSessionAmount = mentor?.amount || booking.session_amount || 0;
    const platformEarnings = perSessionAmount * 0.3;

    return {
      booking_id: booking.id, // Add booking_id for unique key
      mentor_id: booking.mentorId,
      mentor_name: mentor?.name || "Unknown",
      client_name: booking.clientName || booking.clientId || "—",
      mentor_amount: perSessionAmount.toFixed(2), // Per-session price
      platform_earnings: platformEarnings.toFixed(2), // 30% of per-session
    };
  });

setEarningsRows(earningsRows);
  // ✅ Only this line


const enhancedBankRows = (bankData.data || []).map((row) => {
  const mentorRel = Array.isArray(row.mentors) ? row.mentors[0] : row.mentors;
  const mentorName = mentorRel?.applicant_name ?? "Unknown";
  
  // ✅ Get amount directly from the mentor data in the query
  const perSessionAmount = mentorRel?.amount || 0;

  console.log("Finance tab data:", {
    mentor_name: mentorName,
    mentor_amount: perSessionAmount,
    mentor_data: mentorRel
  });

  return {
    ...row,
    mentor_name: mentorName,
    total_session_amount: perSessionAmount, // This should now be 4000.00
  };
});

setPendingWithdrawals(enhancedBankRows);


    } catch (e: any) {
      toast({
        title: "Failed to load admin data",
        description: e?.message ?? "Please check your permissions and try again.",
        variant: "destructive",
      });
    }
  })();
}, [user?.role, navigate]);




  // Derived lists (approved still comes from mentors list which shows verified/public)
const pendingMentors = useMemo(
  () =>
    mentors.filter(
      (m: any) =>
        m.status === "pending" || m.status === "pending_approval" // Only include pending or pending_approval statuses
    ),
  [mentors]
);


  const approvedMentors = useMemo(
    () =>
      mentors.filter(
        (m: any) =>
          (m as any).status === "approved" ||
          (m as any).status === "active" ||
          (m as any).verified === true
      ),
    [mentors]
  );
const refresh = async () => {
  try {
    // Re-fetch the mentors, stats, and bookings
    const [ms, s, bs] = await Promise.all([listMentors(), getAdminStats(), listBookings()]);
    setMentors(ms);
    setStats(s);
    setBookings(bs);

    const { data: apps, error: appsErr } = await supabase
      .from("mentors")
      .select(`
        id,
        profile_id,
        user_id,
        resume_url,
        application_status,
        created_at,
        applicant_name,
        applicant_email,
        applicant_phone,
        specialties,
        applicant_experience,
        current_designation,
        total_experience,
        experiences,
        profiles:profiles!mentors_profile_id_fkey (
          id, user_id, name, email, phone, avatar, title, company, experience, rating, bio, specialties, verified, role, timezone
        )
      `)
      .eq("application_status", "pending") // Fetch only pending applications
      .order("created_at", { ascending: false });

    if (appsErr) throw appsErr;
    setPendingApps(apps ?? []); // Set the pending mentor applications
  } catch (e: any) {
    toast({
      title: "Refresh failed",
      description: e?.message ?? "Try again.",
      variant: "destructive",
    });
  }
};



  // Existing mentor approve by mentorId (kept)
  const handleApproveMentor = async (mentorId: string) => {
    try {
      // Update the mentor's profile with the correct mentor_id
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ mentor_id: mentorId })
        .eq("user_id", mentorId);  // Ensure this is the correct user_id to associate with the mentor

      if (updateError) {
        throw new Error(`Failed to update profile with mentor_id: ${updateError.message}`);
      }

      // Then proceed with the approval workflow (sending emails, updating status, etc.)
      await approveMentor(mentorId);
      await refresh();
      toast({ title: "Mentor Approved", description: "Mentor has been successfully approved." });
    } catch (e: any) {
      toast({ title: "Approve failed", description: e?.message ?? "Please try again.", variant: "destructive" });
    }
  };


  const handleRejectMentor = async (mentorId: string) => {
    try {
      await rejectMentor(mentorId);
      await refresh();
      toast({ title: "Mentor Rejected", description: "Mentor application has been rejected." });
    } catch (e: any) {
      toast({ title: "Reject failed", description: e?.message ?? "Please try again.", variant: "destructive" });
    }
  };

  const handleViewMentor = (mentorId: string) => {
    const m = mentors.find((mt) => mt.id === mentorId) || null;
    setViewMentor(m);
    setViewOpen(true);
  };
  // const handleApproveApplication = async (app: any) => {
  //   try {
  //     // 1. First, update the mentor's status to "approved"
  //     const { error: updateError } = await supabase
  //       .from("mentors")
  //       .update({
  //         application_status: "approved",
  //         approved_at: new Date().toISOString(),
  //         applicant_email: app.applicant_email,
  //         applicant_name: app.applicant_name || "New Mentor",
  //       })
  //       .eq("id", app.id);

  //     if (updateError) {
  //       throw new Error(`Failed to update mentor status: ${updateError.message}`);
  //     }

  //     // 2. Get the mentor's email + user_id from the mentors table
  //     const { data: mentorData, error: mentorError } = await supabase
  //       .from("mentors")
  //       .select("id, applicant_email, applicant_name, application_status, user_id")
  //       .eq("id", app.id)
  //       .single();

  //     if (mentorError || !mentorData?.applicant_email) {
  //       throw new Error("Mentor email is missing or there was an error fetching it.");
  //     }

  //     let email = mentorData.applicant_email;
  //     let userId = mentorData.user_id;

  //     // ✅ If user_id is missing, create a new Supabase Auth user
  //     if (!userId) {
  //       const { data, error } = await supabase.functions.invoke("mentor-invite", {
  //         body: { mode: "create-mentor-user", email, mentorId: app.id },
  //       });

  //       if (error || !data?.user?.id) {
  //         throw new Error(data?.error || error?.message || "Failed to create mentor user");
  //       }

  //       userId = data.user.id;

  //       // Update mentors table with the new user_id
  //       const { error: updateErr } = await supabase
  //         .from("mentors")
  //         .update({ user_id: userId })
  //         .eq("id", app.id);

  //       if (updateErr) {
  //         throw new Error(`Failed to update mentor with new user_id: ${updateErr.message}`);
  //       }
  //     }

  //     // 🚨 REMOVED THE PROFILE UPDATE SECTION 🚨
  //     // Profile will be created in SetPassword component when user sets password
  //     console.log("✅ DEBUG - Mentor approved, profile will be created when user sets password");

  //     // 3. Now call the Edge Function to send the invite
  //     const { data, error } = await supabase.functions.invoke("mentor-invite", {
  //       body: {
  //         mode: "mentor-invite",
  //         mentorId: app.id,
  //         email: email,
  //         redirectTo: `${window.location.origin}/set-password`,
  //       },
  //     });

  //     if (error) throw error;

  //     // Handle different response scenarios
  //     if (data?.alreadyRegistered) {
  //       const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
  //         redirectTo: `${window.location.origin}/set-password`,
  //       });
  //       if (resetErr) throw resetErr;
  //       toast({
  //         title: "Mentor Approved",
  //         description: "Existing account detected — sent password reset email.",
  //       });
  //     } else if (data?.alreadyApproved) {
  //       toast({
  //         title: "Already Approved",
  //         description: "This mentor was already approved. No new email sent.",
  //       });
  //     } else {
  //       toast({
  //         title: "Mentor Approved",
  //         description: "Invite email sent with password setup link.",
  //       });
  //     }

  //     // Remove the row locally for snappier UI
  //     setPendingApps((rows) => rows.filter((r) => r.id !== app.id));
  //     await refresh();
  //   } catch (e: any) {
  //     toast({
  //       title: "Approve failed",
  //       description: e?.message ?? "Please try again.",
  //       variant: "destructive",
  //     });
  //   }
  // };
  const handleApproveApplication = async (app: any) => {
    try {
      // 1. First, update the mentor's status to "approved"
      const { error: updateError } = await supabase
        .from("mentors")
        .update({
          application_status: "approved",
          approved_at: new Date().toISOString(),
        })
        .eq("id", app.id);

      if (updateError) {
        throw new Error(`Failed to update mentor status: ${updateError.message}`);
      }

      // 2. Immediately remove from UI for better UX
      setPendingApps((rows) => rows.filter((r) => r.id !== app.id));

      // 3. Call the Edge Function to send the invite (let it handle user creation)
      const { data, error } = await supabase.functions.invoke("mentor-invite", {
        body: {
          mode: "mentor-invite",
          mentorId: app.id,
          email: app.applicant_email,
          redirectTo: `${window.location.origin}/set-password`,
        },
      });

      if (error) {
        console.warn("Edge function warning:", error.message);
        // Still show success since mentor is approved
        toast({
          title: "Mentor Approved",
          description: "Mentor approved successfully. Email may not have been sent.",
        });
      } else if (data?.alreadyRegistered) {
        toast({
          title: "Mentor Approved",
          description: "Password reset sent to existing user.",
        });
      } else {
        toast({
          title: "Mentor Approved",
          description: "Invite email sent successfully.",
        });
      }

      await refresh();

    } catch (e: any) {
      toast({
        title: "Approve failed",
        description: e?.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectApplication = async (app: any) => {
    try {
      const { error } = await supabase
        .from("mentors")
        .update({ application_status: "rejected" })
        .eq("id", app.id);
      if (error) throw error;

      setPendingApps((rows) => rows.filter((r) => r.id !== app.id));
      await refresh();
      toast({ title: "Mentor Rejected", description: "Application set to rejected." });
    } catch (e: any) {
      toast({ title: "Reject failed", description: e?.message ?? "Please try again.", variant: "destructive" });
    }
  };

  // ✅ view resume (signed URL) – supports both resume_url and resume_path
  const handleViewResume = async (resumePath: string) => {
    try {
      if (!resumePath) throw new Error("No resume found");

      const { data, error } = await supabase.storage
        .from("resumes")
        .createSignedUrl(resumePath, 300); // resumePath includes "public/..."

      if (error) throw error;
      if (!data?.signedUrl) throw new Error("No signed URL returned");

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast({
        title: "Unable to open resume",
        description: e?.message ?? "Try again.",
        variant: "destructive",
      });
    }
  };
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!addEmail) {
        toast({ title: "Email required", description: "Enter the mentor's email.", variant: "destructive" });
        return;
      }

      const normalizedEmail = addEmail.trim().toLowerCase();

      // 1) Find profile by email (user must have signed up)
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("id, user_id")
        .ilike("email", normalizedEmail)
        .maybeSingle();
      if (profErr) throw profErr;
      if (!prof) {
        toast({
          title: "No user found",
          description: "Ask the mentor to sign up first using this email.",
          variant: "destructive",
        });
        return;
      }

      // Ensure user_id exists for profile
      if (!prof.user_id) {
        toast({
          title: "User ID missing",
          description: "This mentor does not have a valid user account linked. Ensure the mentor is properly registered.",
          variant: "destructive",
        });
        return;
      }

      // 2) Update profile details + role=mentor (keep as-is)
      const { error: upProfErr } = await supabase
        .from("profiles")
        .update({ name: addName || null, phone: addPhone || null, role: "mentor" })
        .eq("id", prof.id);
      if (upProfErr) throw upProfErr;

      // 3) Upload resume (optional) — **key must NOT include 'resumes/' prefix**
      let resumePath: string | null = null;
      if (addResumeFile) {
        const ext = addResumeFile.name.split(".").pop()?.toLowerCase() || "pdf";
        const key = `${prof.user_id}/${Date.now()}-resume.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("resumes")
          .upload(key, addResumeFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: addResumeFile.type || "application/pdf",
          });
        if (upErr) throw upErr;
        resumePath = key;
      }

      // 4) Server-side upsert (avoids 409 & RLS issues)
      {
        const { error: rpcErr } = await supabase.rpc("save_mentor_application", {
          _user_id: prof.user_id ?? null,
          _email: normalizedEmail,
          _phone: addPhone || null,
          _linkedin_url: null,
          _total_experience: Number(addExperience) || 0,
          _current_designation: addTitle || null,
          _experiences: null,
          _resume_path: resumePath || null,
        });
        if (rpcErr) throw rpcErr;
      }

      // 5) Find mentors row (by user_id or email), then set approved + approved_at + resume_url if uploaded
      let targetId: string | null = null;
      {
        const { data: byUser, error: byUserErr } = await supabase
          .from("mentors")
          .select("id")
          .eq("user_id", prof.user_id)
          .maybeSingle();
        if (byUserErr) throw byUserErr;
        if (byUser?.id) targetId = byUser.id;
      }
      if (!targetId) {
        const { data: byEmail, error: byEmailErr } = await supabase
          .from("mentors")
          .select("id")
          .ilike("applicant_email", normalizedEmail)
          .maybeSingle();
        if (byEmailErr) throw byEmailErr;
        if (byEmail?.id) targetId = byEmail.id;
      }
      if (targetId) {
        const { error: upStatusErr } = await supabase
          .from("mentors")
          .update({
            application_status: "approved",
            approved_at: new Date().toISOString(),
            // keep the uploaded path in the row for quick access
            resume_url: resumePath || null,
          })
          .eq("id", targetId);
        if (upStatusErr) throw upStatusErr;
      }

      // 6) Save expertise into profile (unchanged)
      const specialArr = addSpecialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const { error: profExpErr } = await supabase
        .from("profiles")
        .update({
          title: addTitle || null,
          experience: Number(addExperience) || 0,
          specialties: specialArr.length ? specialArr : null,
        })
        .eq("id", prof.id);
      if (profExpErr) throw profExpErr;

      // 7) Verify profile (unchanged)
      const { error: verifyErr } = await supabase.rpc("admin_set_verified", {
        _profile_id: prof.id,
        _verified: true,
      });
      if (verifyErr) throw verifyErr;

      await refresh();

      setAddOpen(false);
      setAddName("");
      setAddTitle("");
      setAddExperience("");
      setAddSpecialties("");
      setAddAvatar("");
      setAddEmail("");
      setAddPhone("");
      setAddResumeFile(null);

      toast({ title: "Mentor added", description: "Mentor is now approved and visible in Find Mentors." });
    } catch (e: any) {
      toast({ title: "Add failed", description: e?.message ?? "Please try again.", variant: "destructive" });
    }
  };


  if (!user || user.role !== "admin") return null;

  const statusClasses: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    rescheduled: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-gray-100 text-gray-800",
    no_show: "bg-red-100 text-red-800",
    default: "bg-gray-100 text-gray-800",
  };
const handlePaymentProofUpload = async (rowId: string, mentorId: string) => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*,application/pdf";
  fileInput.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      console.log("🔍 Step 1: Starting upload process...");
      
      // 1) Upload to storage - FIX THE PATH
      console.log("🔍 Step 2: Uploading file to storage...");
      const filePath = `${mentorId}/${Date.now()}-${file.name}`; // ✅ Remove "payment_proofs/" prefix
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("payment_proofs")
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) {
        console.error("❌ Storage upload failed:", uploadError);
        throw uploadError;
      }
      console.log("✅ File uploaded to storage:", uploadData?.path);

      // 2) Update the database record
      console.log("🔍 Step 3: Updating database record...");
      const { error: updateError } = await supabase
        .from("mentor_bank_details")
        .update({ 
          payment_proof_path: uploadData?.path ?? filePath, 
          status: "completed",
          updated_at: new Date().toISOString()
        })
        .eq("id", rowId);

      if (updateError) {
        console.error("❌ Database update failed:", updateError);
        throw updateError;
      }
      console.log("✅ Database update successful");

      // 3) Update UI
      toast({ title: "Payment proof uploaded", description: "Marked as completed." });
      
      setPendingWithdrawals((rows) =>
        rows.map((r) => 
          r.id === rowId ? { 
            ...r, 
            payment_proof_path: uploadData?.path ?? filePath, 
            status: "completed" 
          } : r
        )
      );
      
    } catch (e: any) {
      console.error("❌ Full error details:", e);
      toast({ 
        title: "Upload failed", 
        description: e?.message ?? "Please try again.", 
        variant: "destructive" 
      });
    }
  };
  fileInput.click();
};



  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome back, {user.name}</span>

            {/* Avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full focus:outline-none">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user?.name?.[0] ?? "A"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="space-y-0.5">
                  <div className="text-sm font-semibold leading-none">{user.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => navigate("/admin/profile")}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Update Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/admin/password")}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Update Password
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Mentors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMentors}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Mentors</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingMentors}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="mentors" className="space-y-6">
          <TabsList>
            <TabsTrigger value="mentors">Mentors</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>

          </TabsList>
         <TabsContent value="finance">
  <Card>
    <CardHeader>
      <CardTitle>Withdrawal Requests</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mentor Name</TableHead>
            <TableHead>Session Amount</TableHead>
            <TableHead>Bank</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>IFSC</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingWithdrawals.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-sm text-muted-foreground text-center">
                No withdrawal requests.
              </TableCell>
            </TableRow>
          )}

          {pendingWithdrawals.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.mentor_name}</TableCell>
              <TableCell>₹{row.total_session_amount}</TableCell>
              <TableCell>{row.bank_name}</TableCell>
              <TableCell>{row.account_number}</TableCell>
              <TableCell>{row.ifsc_code}</TableCell>
              <TableCell>{row.branch}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    row.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : row.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell>
                {row.status === "pending" && (
  <Button size="sm" onClick={() => handlePaymentProofUpload(row.id, row.mentor_id)}>
            Upload Proof
          </Button>

                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</TabsContent>
<TabsContent value="earnings">
  <Card>
    <CardHeader>
      <CardTitle>Earnings</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mentor Name</TableHead>
            <TableHead>Client Name</TableHead> {/* 🟡 Added */}
            <TableHead>Mentor Amount</TableHead>
            <TableHead>Platform Earnings (30%)</TableHead>
          </TableRow>
        </TableHeader>
       <TableBody>
  {earningsRows.map((row) => (
    <TableRow key={row.booking_id}> {/* Use booking_id instead of mentor_id */}
      <TableCell>{row.mentor_name}</TableCell>
      <TableCell>{row.client_name}</TableCell>
      <TableCell>₹{row.mentor_amount}</TableCell>
      <TableCell>₹{row.platform_earnings}</TableCell>
    </TableRow>
  ))}
</TableBody>
      </Table>
    </CardContent>
  </Card>
</TabsContent>


          {/* MENTORS TAB */}
          <TabsContent value="mentors" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Mentor Management</h2>
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Mentor
              </Button>
            </div>

            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending">Pending Applications</TabsTrigger>
                <TabsTrigger value="approved">Approved Mentors</TabsTrigger>
              </TabsList>

              {/* PENDING (applications from mentors with optional profile) */}
              {/* <TabsContent value="pending">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Mentor Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mentor</TableHead>
                          <TableHead>Experience</TableHead>
                          <TableHead>Specialties</TableHead>
                          <TableHead>Resume</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingApps.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-sm text-muted-foreground">
                              No pending applications.
                            </TableCell>
                          </TableRow>
                        )}
                        {pendingApps.map((app: any) => {
                          // profiles may be an array or a single object
                          const prof = Array.isArray(app.profiles) ? (app.profiles[0] ?? null) : (app.profiles ?? null);

                          const clean = (v: any) => (typeof v === "string" ? v.trim() : "");
                          const toNum = (v: any) => {
                            const n = typeof v === "string" ? Number(v.trim()) : Number(v);
                            return Number.isFinite(n) ? n : undefined;
                          };

                          // ----- Experiences list (support both column names)
                          const expList: any[] = Array.isArray(app.experiences)
                            ? app.experiences
                            : Array.isArray(app.employment_history)
                              ? app.employment_history
                              : [];

                          // Prefer the most recent item by end_year; if ties, by start_year
                          const sorted = [...expList].sort((a: any, b: any) => {
                            const eA = toNum(a?.end_year) ?? 0;
                            const eB = toNum(b?.end_year) ?? 0;
                            if (eB !== eA) return eB - eA;
                            const sA = toNum(a?.start_year) ?? 0;
                            const sB = toNum(b?.start_year) ?? 0;
                            return sB - sA;
                          });
                          const topExp = sorted[0] || {};

                          // ----- Name (prefer application form)
                          const name =
                            clean(app.applicant_name) ||
                            clean(app.name) ||
                            clean(prof?.name) ||
                            "Unknown";

                          // ----- Email / Avatar
                          const email = prof?.email || app.applicant_email || "";
                          const avatar = prof?.avatar || undefined;

                          // ----- Designation (title) + Company
                          const designation =
                            clean(prof?.title) ||
                            clean(app.current_designation) ||
                            clean(topExp?.title) ||  // now safe: topExp already defined
                            "—";

                          const company =
                            clean(prof?.company) ||
                            clean(topExp?.company) ||
                            "—";

                          // ----- Years precedence: total_experience → experience → applicant_experience → profile.experience
                          const explicitYears =
                            toNum(app.total_experience) ??
                            toNum(app.experience) ??               // your form writes here
                            toNum(app.applicant_experience) ??
                            toNum(prof?.experience);

                          let totalYears = explicitYears ?? 0;

                          // Fallback: derive from exp blocks
                          if (!totalYears && sorted.length > 0) {
                            const nowYear = new Date().getFullYear();
                            const derived = sorted.reduce((sum: number, e: any) => {
                              const s = toNum(e?.start_year) ?? nowYear;
                              const ed = toNum(e?.end_year) ?? nowYear;
                              const span = Math.max(0, ed - s);
                              return sum + span;
                            }, 0);
                            totalYears = derived || 0;
                          }

                          // ----- Specialties
                          const specialties: string[] =
                            (Array.isArray(prof?.specialties) && prof?.specialties) ||
                            (Array.isArray(app.specialties) && app.specialties) ||
                            [];

                          // ----- Resume key
                          const resumeKey = app.resume_path || null;



                          return (
                            <TableRow key={app.id}>
                              <TableCell className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={avatar} />
                                  <AvatarFallback>{(name || "M").charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{name}</div>
                                  <div className="text-sm text-muted-foreground">{email}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {designation}
                                    {company && company !== "—" ? ` @ ${company}` : ""}
                                  </div>

                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{totalYears ?? 0} years</div>
                                {expList.length > 0 && (
                                  <div className="mt-1 space-y-1">
                                    {expList.slice(0, 3).map((e: any, i: number) => (
                                      <div key={i} className="text-xs text-muted-foreground">
                                        {e.company || "Company"} — {e.title || "Designation"}{" "}
                                        ({e.start_year ?? "YYYY"}–{e.end_year ?? "Present"})

                                      </div>
                                    ))}
                                    {expList.length > 3 && (
                                      <div className="text-[10px] text-muted-foreground">+{expList.length - 3} more</div>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {specialties.slice(0, 3).map((s: string) => (
                                    <Badge key={s} variant="secondary" className="text-xs">
                                      {s}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                {resumeKey ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewResume(resumeKey)}
                                  >
                                    View Resume
                                  </Button>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-yellow-600">
                                  Pending
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveApplication(app)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRejectApplication(app)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent> */}

              <TabsContent value="pending">
  <Card>
    <CardHeader>
      <CardTitle>Pending Mentor Applications</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mentor</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Specialties</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingApps.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-sm text-muted-foreground">
                No pending applications.
              </TableCell>
            </TableRow>
          )}

          {pendingApps.map((app: any) => {
            // profiles may be an array or a single object
            const prof = Array.isArray(app.profiles) ? (app.profiles[0] ?? null) : (app.profiles ?? null);

            const clean = (v: any) => (typeof v === "string" ? v.trim() : "");
            const toNum = (v: any) => {
              const n = typeof v === "string" ? Number(v.trim()) : Number(v);
              return Number.isFinite(n) ? n : undefined;
            };

            // Experiences list (support both column names)
            const expList: any[] = Array.isArray(app.experiences)
              ? app.experiences
              : Array.isArray(app.employment_history)
                ? app.employment_history
                : [];

            const sorted = [...expList].sort((a: any, b: any) => {
              const eA = toNum(a?.end_year) ?? 0;
              const eB = toNum(b?.end_year) ?? 0;
              if (eB !== eA) return eB - eA;
              const sA = toNum(a?.start_year) ?? 0;
              const sB = toNum(b?.start_year) ?? 0;
              return sB - sA;
            });
            const topExp = sorted[0] || {};

            // Name, Email, Avatar, etc.
            const name =
              clean(app.applicant_name) ||
              clean(app.name) ||
              clean(prof?.name) ||
              "Unknown";
            const email = prof?.email || app.applicant_email || "";
            const avatar = prof?.avatar || undefined;

            // Designation and Company
            const designation =
              clean(prof?.title) ||
              clean(app.current_designation) ||
              clean(topExp?.title) ||
              "—";
            const company =
              clean(prof?.company) ||
              clean(topExp?.company) ||
              "—";

            // Experience
            const explicitYears =
              toNum(app.total_experience) ??
              toNum(app.experience) ??
              toNum(app.applicant_experience) ??
              toNum(prof?.experience);

            let totalYears = explicitYears ?? 0;

            if (!totalYears && sorted.length > 0) {
              const nowYear = new Date().getFullYear();
              const derived = sorted.reduce((sum: number, e: any) => {
                const s = toNum(e?.start_year) ?? nowYear;
                const ed = toNum(e?.end_year) ?? nowYear;
                const span = Math.max(0, ed - s);
                return sum + span;
              }, 0);
              totalYears = derived || 0;
            }

            // Specialties
            const specialties: string[] =
              (Array.isArray(prof?.specialties) && prof?.specialties) ||
              (Array.isArray(app.specialties) && app.specialties) ||
              [];

            // Resume path
            const resumeKey = app.resume_path || null;

            return (
              <TableRow key={app.id}>
                <TableCell className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={avatar} />
                    <AvatarFallback>{(name || "M").charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-sm text-muted-foreground">{email}</div>
                    <div className="text-xs text-muted-foreground">
                      {designation}
                      {company && company !== "—" ? ` @ ${company}` : ""}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{totalYears ?? 0} years</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {specialties.slice(0, 3).map((s: string) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {resumeKey ? (
                    <Button size="sm" variant="outline" onClick={() => handleViewResume(resumeKey)}>
                      View Resume
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-yellow-600">
                    Pending
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveApplication(app)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRejectApplication(app)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</TabsContent>


              {/* APPROVED (unchanged: uses mentors list) */}
              <TabsContent value="approved">
                <Card>
                  <CardHeader>
                    <CardTitle>Approved Mentors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                     <TableHeader>
  <TableRow>
    <TableHead>Mentor</TableHead>
    <TableHead>Experience</TableHead>
    <TableHead>Specialties</TableHead> {/* ✅ Added */}
    <TableHead>Resume</TableHead>
    <TableHead>Rating</TableHead>
    <TableHead>Sessions</TableHead>
    <TableHead>Status</TableHead>
  </TableRow>
</TableHeader>

<TableBody>
  {approvedMentors.map((mentor: any) => {
    console.log("Approved mentor record:", mentor);

    // ✅ Safely parse specialties
    const specialties =
      Array.isArray(mentor.specialties)
        ? mentor.specialties
        : typeof mentor.specialties === "string"
        ? JSON.parse(mentor.specialties || "[]")
        : [];

    const resumeKey =
      mentor.profiles?.resume_path ||
      mentor.resume_path ||
      mentor.resume_url ||
      null;

    const resumeUrl = resumeKey
      ? `https://ahqkwbysqgqqlipwotwu.supabase.co/storage/v1/object/public/resumes/public/${resumeKey.replace(/^public\//, "")}`
      : null;

    return (
      <TableRow key={mentor.id}>
        <TableCell className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={mentor.avatar} />
            <AvatarFallback>{mentor?.name?.[0] ?? "M"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{mentor.name}</div>
            <div className="text-sm text-muted-foreground">{mentor.title}</div>
          </div>
        </TableCell>

        {/* Experience */}
        <TableCell>{mentor.experience} years</TableCell>

        {/* ✅ Specialties */}
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {specialties.length > 0 ? (
              specialties.slice(0, 3).map((spec: string) => (
                <Badge key={spec} variant="secondary" className="text-xs">
                  {spec}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
            {specialties.length > 3 && (
              <span className="text-[10px] text-muted-foreground">
                +{specialties.length - 3} more
              </span>
            )}
          </div>
        </TableCell>

        {/* Resume */}
        <TableCell>
          {resumeUrl ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(resumeUrl, "_blank")}
            >
              View Resume
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </TableCell>

        {/* Rating */}
        <TableCell>
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span>{mentor.rating ?? 0}</span>
            <span className="text-muted-foreground">({mentor.reviews ?? 0})</span>
          </div>
        </TableCell>

        {/* Sessions */}
        <TableCell>{mentor.reviews ?? 0}</TableCell>

        {/* ✅ Status + Download */}
        <TableCell>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          </div>
        </TableCell>
      </TableRow>
    );
  })}
</TableBody>


                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* BOOKINGS TAB */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Mentor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => {
                      const mentor = mentors.find((m) => m.id === (booking as any).mentorId);
                      const cls = statusClasses[String((booking as any).status)] ?? statusClasses.default;
                      const clientLabel = (booking as any).menteeName ?? (booking as any).clientId ?? "Unknown";
                      return (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                          <TableCell>{clientLabel}</TableCell>
                          <TableCell>{mentor?.name || "Unknown"}</TableCell>
                          <TableCell>
                            <Badge className={cls}>{(booking as any).status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm">Sarah Chen approved as mentor</span>
                      <span className="text-xs text-muted-foreground ml-auto">2h ago</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-sm">New booking created</span>
                      <span className="text-xs text-muted-foreground ml-auto">4h ago</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span className="text-sm">Mentor application submitted</span>
                      <span className="text-xs text-muted-foreground ml-auto">6h ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Platform Name</span>
                      <span className="text-sm font-medium">ApplyWizz</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Support Email</span>
                      <span className="text-sm font-medium">support@applywizz.com</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Default Rate Range</span>
                      <span className="text-sm font-medium">$100 - $300</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Eye Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mentor Details</DialogTitle>
          </DialogHeader>

          {viewMentor && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                  {viewMentor.avatar ? (
                    <img src={viewMentor.avatar} alt={viewMentor.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-sm font-medium">
                      {viewMentor.name?.[0] ?? "M"}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-semibold">{viewMentor.name}</div>
                  <div className="text-sm text-muted-foreground">{viewMentor.title}</div>
                  {viewMentor.company && (
                    <div className="text-xs text-muted-foreground">{viewMentor.company}</div>
                  )}
                </div>
              </div>

              <div className="text-sm">
                <span className="font-medium">Experience:</span> {viewMentor.experience} years
              </div>

              {Array.isArray(viewMentor.specialties) && viewMentor.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {viewMentor.specialties.slice(0, 6).map((s) => (
                    <span key={s} className="px-2 py-1 rounded-md bg-muted text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {viewMentor.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed">{viewMentor.bio}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Mentor Dialog (updated to collect email/phone/resume) */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Mentor (Approve Now)</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* REQUIRED NEW FIELDS */}
              <div className="md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="mentor@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={addName} onChange={(e) => setAddName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="phone">Mobile</Label>
                <Input id="phone" value={addPhone} onChange={(e) => setAddPhone(e.target.value)} placeholder="+91 ..." />
              </div>

              {/* Expertise */}
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={addTitle} onChange={(e) => setAddTitle(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="exp">Experience (years)</Label>
                <Input
                  id="exp"
                  type="number"
                  min={0}
                  value={addExperience}
                  onChange={(e) => setAddExperience(e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="specialties">Expertise (comma separated)</Label>
                <Input
                  id="specialties"
                  value={addSpecialties}
                  onChange={(e) => setAddSpecialties(e.target.value)}
                  placeholder="React, Supabase, Tailwind"
                />
              </div>

              {/* Optional visuals */}
              <div className="md:col-span-2">
                <Label htmlFor="avatar">Avatar URL (optional)</Label>
                <Input
                  id="avatar"
                  value={addAvatar}
                  onChange={(e) => setAddAvatar(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              {/* Resume */}
              <div className="md:col-span-2">
                <Label htmlFor="resume">Resume (PDF, optional)</Label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setAddResumeFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save & Approve</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
;
