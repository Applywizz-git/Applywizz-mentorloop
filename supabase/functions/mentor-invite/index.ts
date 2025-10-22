// @ts-nocheck

/// <reference lib="deno.ns" />
/// <reference lib="dom" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ===== ENV =====
const TENANT_ID = Deno.env.get("TENANT_ID")!;
const CLIENT_ID = Deno.env.get("CLIENT_ID")!;
const CLIENT_SECRET = Deno.env.get("CLIENT_SECRET")!;
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL")!;
const PROJECT_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") || ""; 

// Supabase admin client
const sb = createClient(PROJECT_URL, SERVICE_ROLE_KEY);

// ===== Microsoft Graph helpers =====
async function getGraphToken(): Promise<string> {
  const body = new URLSearchParams();
  body.set("client_id", CLIENT_ID);
  body.set("client_secret", CLIENT_SECRET);
  body.set("scope", "https://graph.microsoft.com/.default");
  body.set("grant_type", "client_credentials");

  const res = await fetch(
    `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
    { method: "POST", body }
  );
  if (!res.ok) throw new Error(`Token error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.access_token as string;
}

async function sendGraphMail(
  to: string,
  subject: string,
  body: string,
  kind: "Text" | "HTML" = "Text"
) {
  const token = await getGraphToken();
  const endpoint = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(SENDER_EMAIL)}/sendMail`;

  const payload = {
    message: {
      subject,
      body: { contentType: kind, content: body },
      toRecipients: [{ emailAddress: { address: to } }],
    },
    saveToSentItems: true,
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`sendMail failed ${res.status}: ${await res.text()}`);
}

// ===== Mentor contact helper =====
async function getMentorContact(mentorId: string) {
  console.log(`Fetching mentor data for mentorId: ${mentorId}`);

  const { data: mentor, error } = await sb
    .from("mentors")
    .select("id, applicant_email, user_id, name") // Including applicant_email directly
    .eq("id", mentorId)
    .single();
  
  if (error || !mentor) {
    console.error(`Error fetching mentor: ${error?.message || "Mentor not found"}`);
    throw new Error(error?.message || "Mentor not found");
  }

  // Directly use the mentor's applicant_email
  let mentorEmail: string | null = mentor.applicant_email;
  console.log(`Found mentor email: ${mentorEmail}`);

  // If applicant_email is null or empty, check profiles table (fallback)
  if (!mentorEmail && mentor.user_id) {
    const { data: profile, error: pErr } = await sb
      .from("profiles")
      .select("email")
      .eq("id", mentor.user_id)
      .single();

    if (!pErr && profile?.email) {
      mentorEmail = profile.email;
      console.log(`Found mentor email from profiles: ${mentorEmail}`);
    }
  }

  // If still no email found, check Supabase Auth
  if (!mentorEmail && mentor.user_id) {
    const { data, error: uErr } = await sb.auth.admin.getUserById(mentor.user_id);
    if (!uErr && data?.user?.email) {
      mentorEmail = data.user.email as string;
      console.log(`Found mentor email from auth: ${mentorEmail}`);
    }
  }

  return { mentor, mentorEmail };
}

// ===== DB Webhook helpers =====
function isDbWebhookPayload(x: any) {
  return x && typeof x === "object" && "type" in x && "table" in x && "record" in x;
}

// Map your schema/statuses to internal modes
function mapWebhookToMode(payload: any) {
  const rec = payload.record || {};
  const norm = (v: any) => (v ?? "").toString().trim().toLowerCase();

  const status = norm(rec.status);

  if (payload.table !== "mentors") return null;

  // Handle mentor invite event
  if (payload.type === "INSERT" && status === "approved") {
    console.log(`Detected mentor invite for mentorId: ${rec.id}`);
    return {
      mode: "mentor-invite" as const,
      mentorId: rec.id,
    };
  }

  return null;
}

// ===== HTTP handler =====
Deno.serve(async (req: Request) => {
  console.log("Request received:", req);

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    let { mode, mentorId, email }: { mode?: string; mentorId?: string; email?: string } = body;

    if (isDbWebhookPayload(body)) {
      const translated = mapWebhookToMode(body);
      if (!translated) {
        return new Response(JSON.stringify({ ok: true, skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      mode = translated.mode;
      mentorId = translated.mentorId;
    }

    if (!mode) {
      return new Response(JSON.stringify({ error: "mode required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

// ---- CREATE MENTOR USER ----
if (mode === "create-mentor-user") {
  console.log("🚨 CREATE-MENTOR-USER STARTED", { email, mentorId });

  if (!email) {
    return new Response(JSON.stringify({ error: "Email is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let userId: string | null = null;

  // 1. Check if user already exists
  console.log("🔍 Checking if user exists:", email);
  const { data: userList, error: listErr } = await sb.auth.admin.listUsers();
  if (listErr) {
    console.error("❌ Failed to fetch users:", listErr.message);
    return new Response(
      JSON.stringify({ error: `Failed to fetch users: ${listErr.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const existingUser = userList.users.find(u => u.email === email);
  if (existingUser) {
    console.log("⚠️ User already exists:", existingUser.id);
    userId = existingUser.id;
  } else {
    // 2. Create new user if not found
    console.log("👤 Creating new user for:", email);
    const { data: newUser, error: createErr } = await sb.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    if (createErr) {
      console.error("❌ Failed to create user:", createErr.message);
      return new Response(
        JSON.stringify({ error: `Failed to create Supabase user: ${createErr.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    userId = newUser.user?.id ?? null;
    console.log("✅ New user created:", userId);
  }

  // 3. Get mentor details to copy to profile
  let mentorDetails = null;
  if (mentorId) {
    console.log("🔍 Fetching mentor details for:", mentorId);
    
    // USE THESE EXACT COLUMN NAMES from your table
    const { data: mentor, error: mentorErr } = await sb
      .from("mentors")
      .select(`
        id,
        name,                    // This has the name "ganesh"
        applicant_email, 
        experience,              // This has experience (not applicant_experience)
        specialties,
        bio,                     // This has bio  
        linkedin_url,
        current_designation,
        user_id
      `)
      .eq("id", mentorId)
      .single();

    if (mentorErr) {
      console.error("❌ Failed to fetch mentor details:", mentorErr.message);
    } else if (mentor) {
      mentorDetails = mentor;
      console.log("✅ Found mentor details:", JSON.stringify(mentorDetails, null, 2));
    } else {
      console.log("❌ No mentor found with ID:", mentorId);
    }
  }

  // 4. Create or update profile with mentor details
  if (userId) {
    const profileData = {
      id: userId,
      user_id: userId,
      name: mentorDetails?.name || null,                    // Use "name" directly
      email: mentorDetails?.applicant_email || email,
      experience: mentorDetails?.experience || null,        // Use "experience" directly (not applicant_experience)
      specialties: mentorDetails?.specialties || [],
      bio: mentorDetails?.bio || null,                      // Use "bio" directly
      linkedin_url: mentorDetails?.linkedin_url || null,
      current_designation: mentorDetails?.current_designation || null,
      role: "mentor",
      updated_at: new Date().toISOString(),
    };

    console.log("📝 Final Profile data to upsert:", JSON.stringify(profileData, null, 2));

    // Update the existing profile
    const { data: profileResult, error: profileError } = await sb
      .from("profiles")
      .update(profileData)
      .eq("id", userId)
      .select();

    if (profileError) {
      console.error("❌ Failed to update profile:", profileError.message);
    } else {
      console.log("✅ Profile updated successfully:", profileResult);
    }
  } else {
    console.log("❌ No user ID available for profile creation");
  }

  // 5. Link user to mentor row
  if (mentorId && userId) {
    console.log("🔗 Linking mentor to user:", { mentorId, userId });
    const { error: updateErr } = await sb
      .from("mentors")
      .update({ user_id: userId })
      .eq("id", mentorId);

    if (updateErr) {
      console.error("⚠️ Failed to update mentor row:", updateErr.message);
    } else {
      console.log("✅ Mentor linked with user");
    }
  }

  console.log("🎉 User setup complete");
  return new Response(JSON.stringify({ ok: true, userId }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
// ---- MENTOR INVITE ----
if (mode === "mentor-invite") {
  console.log("Processing mentor invite for mentorId:", mentorId);

  if (!mentorId) {
    console.error("mentorId missing");
    return new Response(
      JSON.stringify({ error: "mentorId is required for mode=mentor-invite" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Load mentor details
  const { mentor, mentorEmail } = await getMentorContact(mentorId);
  if (!mentorEmail) {
    throw new Error("Mentor email not found");
  }

  // Use frontend URL for redirect
 // ✅ Use your live Vercel domain
const frontendUrl = "https://mentorship-loop-1.vercel.app";
const redirectTo = `${frontendUrl}/set-password?mentorId=${mentorId}&email=${encodeURIComponent(mentorEmail)}`;

  console.log("Redirect URL:", redirectTo);

  // ---- Generate Invite or Recovery Link ----
  let linkData, linkError;
  let linkType: "invite" | "recovery" = "invite";

  ({ data: linkData, error: linkError } = await sb.auth.admin.generateLink({
    type: "invite",
    email: mentorEmail,
    options: { redirectTo },
  }));

  // If invite fails because user already exists → fall back to recovery
  if (linkError) {
    console.warn("⚠️ Invite failed, trying recovery:", linkError.message);
    linkType = "recovery";
    ({ data: linkData, error: linkError } = await sb.auth.admin.generateLink({
      type: "recovery",
      email: mentorEmail,
      options: { redirectTo },
    }));
  }

  if (linkError || !linkData?.properties?.action_link) {
    console.error("Link generation failed:", linkError);
    throw new Error("Could not generate invite/recovery link");
  }

  const inviteUrl = linkData.properties.action_link;
  console.log(`✅ Generated ${linkType} link:`, inviteUrl);

  // ---- Send Email ----
  await sendGraphMail(
    mentorEmail,
    "Welcome to Mentor Platform",
    `Hello ${mentor.name || "Mentor"},\n\nYou have been approved!\n\nClick below to set your password and access your dashboard:\n\n${inviteUrl}\n\nIf you didn't expect this, you can ignore this message.`,
    "Text"
  );

  // Also update mentor status to mark invite as sent
  await sb
    .from("mentors")
    .update({ invite_sent: true, invite_sent_at: new Date().toISOString() })
    .eq("id", mentorId);

  return new Response(JSON.stringify({ ok: true, mentorEmail, linkType }), {
    status: 200,
    headers: corsHeaders,
  });
}

    // ---- FALLBACK ----
    return new Response(JSON.stringify({ error: "invalid mode" }), {
      status: 400,
      headers: corsHeaders,
    });

  } catch (e: any) {
    console.error("[mentor-invite] error:", e?.message || e);
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
