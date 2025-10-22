// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "@/lib/supabase";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

// type GateState = "checking" | "approved" | "pending" | "none" | "error";

// export default function MentorGate({ children }: { children: React.ReactNode }) {
//   const navigate = useNavigate();
//   const [state, setState] = useState<GateState>("checking");
//   const [message, setMessage] = useState<string>("");
//   const [isSigningOut, setIsSigningOut] = useState(false);


//   async function getCurrentUserId(): Promise<string | null> {
//     // Fast path: session is read from memory/storage without network
//     const { data: sess } = await supabase.auth.getSession();
//     const fastUserId = sess?.session?.user?.id ?? null;
//     if (fastUserId) return fastUserId;

//     // Fallback (rare): may do a network call
//     const { data: auth } = await supabase.auth.getUser();
//     return auth?.user?.id ?? null;
//   }

// async function checkStatus() {
//   try {
//      if (isSigningOut) return;
//     setState("checking");

//     // 1) Auth user
//     const userId = await getCurrentUserId();
//     if (!userId) {
//       setState("none");
//       navigate("/", { replace: true });
//       return;
//     }

//     // 2) Load profile
//     const { data: profile, error: profErr } = await supabase
//       .from("profiles")
//       .select("id, verified, email, role")
//       .or(`user_id.eq.${userId},id.eq.${userId}`)
//       .maybeSingle();
//     if (profErr) throw profErr;

//     const profileId = profile?.id ?? null;

//     // 3) Find mentor row for THIS user/profile
//     const { data: mentor, error: mentorErr } = await supabase
//       .from("mentors")
//       .select("id, application_status, user_id, profile_id")
//       .or(
//         [
//           `user_id.eq.${userId}`,
//           profileId ? `profile_id.eq.${profileId}` : "",
//         ]
//           .filter(Boolean)
//           .join(",")
//       )
//       .maybeSingle();
//     if (mentorErr) throw mentorErr;

//     // No mentor row -> hasn't applied
//     if (!mentor) {
//       setMessage("You haven’t started a mentor application yet.");
//       setState("none");
//       return;
//     }

//     // 4) Approved -> update profile role and let them in
//     if (mentor.application_status === "approved") {
//       // Update the profiles table to set role = 'mentor'
//       const { error: profileUpdateError } = await supabase
//         .from("profiles")
//         .update({ role: "mentor" })
//         .eq("user_id", userId);

//       if (profileUpdateError) {
//         throw profileUpdateError;
//       }

//       setMessage("");
//       setState("approved");
//       return;
//     }

//     // 5) Pending approval
//     setMessage("Your mentor application is pending admin approval.");
//     setState("pending");
//   } catch (e: any) {
//     setMessage(e?.message ?? "Something went wrong while checking your status.");
//     setState("error");
//   }
// }


//   useEffect(() => {
//     checkStatus();

//     // Re-check on auth changes; use session from callback to decide fast
//   const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
//   const uid = session?.user?.id ?? null;

//   if (event === "SIGNED_OUT" || !uid) {
//     // 🧠 Mark as logging out so checkStatus doesn't re-run
//     setIsSigningOut(true);
//     setState("none");
//     navigate("/", { replace: true });
//     return;
//   }

//   if (event === "SIGNED_IN" && !isSigningOut) {
//     checkStatus();
//   }
// });


//     return () => sub.subscription.unsubscribe();
//   }, []);

//   if (state === "checking") return null; // no flash

//   if (state === "approved") return <>{children}</>;

//   return (
//     <div className="max-w-xl mx-auto p-4">
//       <Card>
//         <CardHeader>
//           <CardTitle>Mentor Access</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           <p className="text-muted-foreground">{message}</p>

//           <div className="flex gap-2 pt-2">
//             {state === "none" && (
//               <Button asChild>
//                 <a href="/become-mentor">Apply to become a mentor</a>
//               </Button>
//             )}

//             {(state === "pending" || state === "none" || state === "error") && (
//               <Button variant="outline" onClick={checkStatus}>
//                 Refresh status
//               </Button>
//             )}

//             <Button variant="ghost" onClick={() => navigate("/")}>
//               Go home
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type GateState = "checking" | "approved" | "pending" | "none" | "error";

export default function MentorGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<GateState>("checking");
  const [message, setMessage] = useState<string>("");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  async function getCurrentUserId(): Promise<string | null> {
    const { data: sess } = await supabase.auth.getSession();
    const fastUserId = sess?.session?.user?.id ?? null;
    if (fastUserId) return fastUserId;

    const { data: auth } = await supabase.auth.getUser();
    return auth?.user?.id ?? null;
  }

  async function checkStatus() {
    try {
      if (isSigningOut) return; // 🛑 Prevent running during logout
      setState("checking");

      // 1) Auth user
      const userId = await getCurrentUserId();
      if (!userId) {
        setState("none");
        navigate("/", { replace: true });
        return;
      }

      // 2) Load profile
      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("id, verified, email, role")
        .or(`user_id.eq.${userId},id.eq.${userId}`)
        .maybeSingle();
      if (profErr) throw profErr;

      const profileId = profile?.id ?? null;

      // 3) Find mentor row for THIS user/profile
      const { data: mentor, error: mentorErr } = await supabase
        .from("mentors")
        .select("id, application_status, user_id, profile_id")
        .or(
          [
            `user_id.eq.${userId}`,
            profileId ? `profile_id.eq.${profileId}` : "",
          ]
            .filter(Boolean)
            .join(",")
        )
        .maybeSingle();
      if (mentorErr) throw mentorErr;

      // No mentor row -> hasn't applied
      if (!mentor) {
        setMessage("You haven’t started a mentor application yet.");
        setState("none");
        return;
      }

      // 4) Approved -> update profile role and let them in
      if (mentor.application_status === "approved") {
        const { error: profileUpdateError } = await supabase
          .from("profiles")
          .update({ role: "mentor" })
          .eq("user_id", userId);

        if (profileUpdateError) throw profileUpdateError;

        setMessage("");
        setState("approved");
        return;
      }

      // 5) Pending approval
      setMessage("Your mentor application is pending admin approval.");
      setState("pending");
    } catch (e: any) {
      setMessage(e?.message ?? "Something went wrong while checking your status.");
      setState("error");
    }
  }

  useEffect(() => {
    let active = true;

    // ✅ Initial session check (prevents flashing after logout)
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id ?? null;

      if (!userId) {
        navigate("/", { replace: true });
        setSessionChecked(true);
        return;
      }

      if (active) {
        setSessionChecked(true);
        await checkStatus();
      }
    };

    init();

    // ✅ Listen to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const uid = session?.user?.id ?? null;

      if (event === "SIGNED_OUT" || !uid) {
        setIsSigningOut(true);
        navigate("/", { replace: true });
        return;
      }

      if (event === "SIGNED_IN" && active) {
        checkStatus();
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // 🌀 Small loader instead of blank flash
  if (!sessionChecked || isSigningOut || state === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ✅ Allow mentors in
  if (state === "approved") return <>{children}</>;

  // ❌ Others see restricted message
  return (
    <div className="max-w-xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Mentor Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">{message}</p>

          <div className="flex gap-2 pt-2">
            {state === "none" && (
              <Button asChild>
                <a href="/become-mentor">Apply to become a mentor</a>
              </Button>
            )}

            {(state === "pending" || state === "none" || state === "error") && (
              <Button variant="outline" onClick={checkStatus}>
                Refresh status
              </Button>
            )}

            <Button variant="ghost" onClick={() => navigate("/")}>
              Go home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
