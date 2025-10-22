import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";



export default function SetPassword() {
  const location = useLocation();
  const navigate = useNavigate();



  const [email, setEmail] = useState<string>("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
 const [mentorId, setMentorId] = useState<string>("");        // ✅ restore this
const [mentorData, setMentorData] = useState<any>(null);     // ✅ keep this below

  function getQueryParam(name: string) {
    return new URLSearchParams(location.search).get(name);
  }


useEffect(() => {
  // ✅ 1. Check if Supabase tokens exist in URL (invite link provides these)
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");

  if (accessToken && refreshToken) {
    console.log("✅ Found Supabase invite tokens in URL, setting session...");
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    }).then(({ error }) => {
      if (error) {
        console.error("❌ Failed to set session from invite link:", error);
      } else {
        console.log("✅ Supabase session established from invite link");
      }
    });
  }

  // ✅ 2. Your existing code starts here
  const mentorIdFromUrl = getQueryParam("mentorId");
  const emailFromUrl = getQueryParam("email");

  console.log('🔍 DEBUG - URL Params:', { 
    mentorIdFromUrl, 
    emailFromUrl,
    fullUrl: window.location.href,
    search: location.search 
  });



    if (!mentorIdFromUrl) {
      console.error('❌ DEBUG - Missing mentorId from URL');
      toast({
        title: "Invalid Link",
        description: "Missing mentor ID in the invitation link.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }



    if (!emailFromUrl) {
      console.error('❌ DEBUG - Missing email from URL');
      toast({
        title: "Invalid Link",
        description: "Missing email in the invitation link.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }



    setMentorId(mentorIdFromUrl);
    setEmail(emailFromUrl);



const verifyMentor = async () => {
  try {
    console.log("🔍 DEBUG - Starting mentor verification for ID:", mentorIdFromUrl);

    // (optional) sanity: table exists
    const { error: tableError } = await supabase
      .from("mentors")
      .select("*", { count: "exact", head: true });
    if (tableError) {
      console.error("❌ DEBUG - Table access error:", tableError);
      throw new Error(`Cannot access mentors table: ${tableError.message}`);
    }
    console.log("✅ DEBUG - Mentors table is accessible");

    // fetch everything we need for profile creation/validation
    const { data: fetchedMentor, error } = await supabase
      .from("mentors")
      .select(`
        id,
        applicant_email,
        applicant_name,
        name,
        application_status,
        specialties,
        applicant_experience,
        total_experience,
        experience,
        current_designation,
        experiences
      `)
      .eq("id", mentorIdFromUrl!)
      .maybeSingle();

    console.log("🔍 DEBUG - Query result:", { fetchedMentor, error });
    if (error) throw error;
    if (!fetchedMentor) throw new Error("Mentor record not found");

    // status check (case-insensitive)
    const status = String(fetchedMentor.application_status ?? "").trim().toLowerCase();
    if (status !== "approved") {
      throw new Error(`Mentor account status is "${status}" but needs to be "approved"`);
    }

    // email check (trim + lowercase on both sides; skip if either missing)
    const urlEmail = String(emailFromUrl ?? "").trim().toLowerCase();
    const dbEmail = String(fetchedMentor.applicant_email ?? "").trim().toLowerCase();
    if (dbEmail && urlEmail && dbEmail !== urlEmail) {
      console.warn("⚠️ DEBUG - Email mismatch:", { dbEmail, urlEmail });
      throw new Error("Email in the link does not match the mentor's registered email.");
    }

    // store for handleCreateAccount
    setMentorData(fetchedMentor);

    console.log("✅ DEBUG - Mentor verification successful");
    setLoading(false);
  } catch (error: any) {
    console.error("❌ DEBUG - Verification failed:", error);
    toast({
      title: "Invalid Invitation Link",
      description: error?.message || "This invitation link is invalid or expired.",
      variant: "destructive",
    });
    setLoading(false);
  }
};


  verifyMentor();
  }, [location.search]);

  const canSubmit = useMemo(
    () => pw.length >= 8 && pw === confirm && !!email,
    [pw, confirm, email]
  );
  
const handleCreateAccount = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!canSubmit || !email || !mentorId) return;

  try {
    setUpdating(true);
    console.log("🔍 DEBUG - Starting account creation for:", { email, mentorId });

    // Step 1: Set password for the existing invited user
    const { data: authData, error: authError } = await supabase.auth.updateUser({
      password: pw,
    });

    if (authError) {
      console.error("❌ DEBUG - Password update failed:", authError);
      throw new Error("Failed to set password. Please try again or contact support.");
    }

    if (!authData.user) {
      throw new Error("User authentication failed");
    }
const userId = authData.user.id;


// helpers
const toNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const clean = (v: any) => (typeof v === "string" ? v.trim() : "");

// use the fetched mentor application row from state (set in verifyMentor)
const appRow = mentorData || {};

// name: prefer what they typed in the form
const preferredName =
  clean(appRow.applicant_name) ||
  clean(appRow.name) ||
  (email.split("@")[0] || "Mentor");

// years: coalesce across all mentor fields (ensure NUMBER)
const yoe =
  toNum(appRow.total_experience) ??
  toNum(appRow.experience) ??
  toNum(appRow.applicant_experience) ??
  0;

// title/company: prefer current_designation, else the truly "latest" experience
const expList = Array.isArray(appRow.experiences) ? appRow.experiences : [];
const latest = (() => {
  if (!expList.length) return null;
  // Prefer a current role (no end_year), else the one with highest end_year, else highest start_year
  const current = expList.find((e: any) => e?.end_year == null);
  if (current) return current;
  const byEnd = [...expList].filter((e: any) => toNum(e?.end_year) != null)
    .sort((a: any, b: any) => (toNum(b.end_year)! - toNum(a.end_year)!));
  if (byEnd[0]) return byEnd[0];
  const byStart = [...expList].filter((e: any) => toNum(e?.start_year) != null)
    .sort((a: any, b: any) => (toNum(b.start_year)! - toNum(a.start_year)!));
  return byStart[0] ?? null;
})();

const title   = clean(appRow.current_designation) || clean(latest?.title);
const company = clean(latest?.company);

// specialties for profiles: store ARRAY if available, else null
const profileSpecialties: string[] | null =
  Array.isArray(appRow.specialties) ? appRow.specialties : null;


console.log("✅ DEBUG - Password set successfully for user:", userId);

// link mentors.user_id (DO NOT set profile_id yet; we will after profile upsert)
const { error: mentorUpdateError } = await supabase
  .from("mentors")
  .update({
    user_id: userId,
    updated_at: new Date().toISOString(),
  })
  .eq("id", mentorId);

if (mentorUpdateError) {
  console.error("⚠️ DEBUG - Failed to update mentor with user_id:", mentorUpdateError);
}

// (optional) you can keep this profile existence check if you use it later
const { data: existingProfile, error: profileCheckError } = await supabase
  .from("profiles")
  .select("id, user_id")
  .eq("user_id", userId)
  .maybeSingle();

if (profileCheckError) {
  console.error("⚠️ DEBUG - Error checking existing profile:", profileCheckError);
}

// Upsert profile with application data (name/title/company/yoe/specialties)
const { error: profileUpsertError } = await supabase
  .from("profiles")
  .upsert(
    {
      id: userId,                 // keep id === auth uid
      user_id: userId,
      mentor_id: mentorId,
      name: preferredName,        // real form-entered name
      email: email,
      role: "mentor",
      title: title || null,       // designation
      company: company || null,
      experience: yoe,            // <-- store as NUMBER so admin/find-mentors show correct years
      specialties: profileSpecialties, // <-- store as ARRAY if available, else null
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );


if (profileUpsertError) {
  console.error("❌ DEBUG - Profile upsert failed:", profileUpsertError);
  throw new Error("Failed to create your profile. Please contact support.");
}


    // Step 5: Update mentor with profile_id (final link)
    const { data: finalProfile, error: finalProfileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!finalProfileError && finalProfile) {
      await supabase
        .from("mentors")
        .update({ profile_id: finalProfile.id })
        .eq("id", mentorId);
    }

    // Step 6: Success!
    console.log("✅ DEBUG - Account setup complete");
    toast({
      title: "Account setup complete!",
      description: "Welcome to your mentor dashboard.",
    });

    setTimeout(() => {
      navigate("/dashboard/mentor", { replace: true });
    }, 1500);

  } catch (error: any) {
    console.error("❌ DEBUG - Account creation failed:", error);
    toast({
      title: "Error creating account",
      description: error.message || "Please try again or contact support.",
      variant: "destructive",
    });
  } finally {
    setUpdating(false);
  }
};


  if (loading) {
    return (
      <div className="max-w-md mx-auto px-6 py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Verifying your invitation link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }



  return (
    <div className="max-w-md mx-auto px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create Your Mentor Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email"
                type="email" 
                value={email} 
                readOnly 
                className="bg-muted" 
              />
              <p className="text-xs text-muted-foreground mt-1">
                This is the email associated with your mentor application
              </p>
            </div>
            
            <div>
              <Label htmlFor="password">Create Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                minLength={8}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="Confirm your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={8}
                required
              />
            </div>
            
            {pw && confirm && pw !== confirm && (
              <p className="text-sm text-destructive">Passwords do not match</p>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!canSubmit || updating}
            >
              {updating ? "Creating Account..." : "Create Account & Continue"}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              By creating an account, you'll gain access to your mentor dashboard.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
