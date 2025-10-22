import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/ui/navbar";
import { Calendar, Clock, User, Settings } from "lucide-react";
import MentorGate from "@/components/MentorGate";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import {
  getCurrentMentorId,
  getMentor,
  listBookings,
  listSlotsForMentor,
  updateMentorProfile,
  getMyMentorId,
  listUpcomingForMentor,
  rescheduleBookingDb,
  setCurrentMentorId,
  declineBookingDb,
  getMentorApprovalStatus,
  listPendingRequestsForMentor,
} from "@/lib/data";

import type { Booking, TimeSlot, Mentor, SessionPackage, WeeklySlot } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchUnreadNotifications } from "@/lib/notificationUtils";

const MentorDashboard = () => {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newSlotId, setNewSlotId] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", title: "", company: "" });
  
  // Pricing editor
  const [currency, setCurrency] = useState("USD");
  const [packagesState, setPackagesState] = useState<SessionPackage[]>([
    { id: "pkg30-ui", label: "30 min", minutes: 30, price: 30, currency: "USD" as any, active: true },
    { id: "pkg45-ui", label: "45 min", minutes: 45, price: 40, currency: "USD" as any, active: true },
    { id: "pkg60-ui", label: "60 min", minutes: 60, price: 50, currency: "USD" as any, active: true },
  ]);

  // Availability editor
  const [weeklyEdit, setWeeklyEdit] = useState<WeeklySlot[]>([]);
  const [bufferEdit, setBufferEdit] = useState<number>(15);

  // Earnings
  const [mtd, setMtd] = useState(0);
  const [lifetime, setLifetime] = useState(0);
  const [pending, setPending] = useState(0);
  const [tx, setTx] = useState<{ id: string; date: string; client: string; amount: number; status: "pending" | "paid" }[]>([]);
  const [mentorAmount, setMentorAmount] = useState<number>(0);
  // DB-backed upcoming rows
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [declineNote, setDeclineNote] = useState<string>("");
  // 📝 Review state
const [reviewText, setReviewText] = useState<{ [bookingId: string]: string }>({});
const [reviewRating, setReviewRating] = useState<{ [bookingId: string]: number }>({});
// 🗨️ Feedback dialog state
const [openFeedbackDialog, setOpenFeedbackDialog] = useState<string | null>(null);
const [clientFeedback, setClientFeedback] = useState<{ rating: number; text: string } | null>(null);
// 🧾 Payout proofs (uploaded by admin in Finance tab)
// 🧾 Payout proofs (from mentor_bank_details)
const [payoutProofs, setPayoutProofs] = useState<
  {
    id: string;
    created_at: string;
    status: string;
    payment_proof_path: string | null;
    booking_id: string | null;
    client_name: string | null;
    session_amount: number | null;
  }[]
>([]);
// 💰 Mentor's withdrawable amount




  const { toast } = useToast();

  // 🔒 Approval gate state
  const [approved, setApproved] = useState<boolean>(false);
  const [appStatus, setAppStatus] = useState<"pending" | "approved" | "rejected" | "none">("none");
  const [loadingGate, setLoadingGate] = useState<boolean>(true);

  // Unread notifications count
  const [unreadNotifications, setUnreadNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // ✅ Edge Function URL (Vite env)
  const functionsUrl = (import.meta as any).env?.VITE_SUPABASE_FUNCTIONS_URL as string | undefined;

  // Load current approval once
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid) { setLoadingGate(false); return; }
      try {
        const s = await getMentorApprovalStatus(uid);
        const effectiveApproved = Boolean(s.approved) || s.application_status === "approved";
        setApproved(effectiveApproved);
        setAppStatus((s.application_status ?? (effectiveApproved ? "approved" : "pending")) as any);
      } catch {
        setApproved(false);
        setAppStatus("none");
      } finally {
        setLoadingGate(false);
      }
    })();
  }, []);

  // Fetch unread notifications when mentor is logged in
  useEffect(() => {
    if (mentor?.user_id) {
      const load = async () => {
        const notifications = await fetchUnreadNotifications(mentor.user_id);
        setUnreadNotifications(notifications);
        setUnreadCount(notifications.length);
      };
      load();
    }
  }, [mentor]);

  // Real-time update for approval status
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;

      channel = supabase
        .channel("mentor-approval-watch")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "mentors", filter: `user_id=eq.${uid}` },
          (payload) => {
            const row: any = payload.new;
            const ok =
              Boolean(row?.approved) ||
              row?.application_status === "approved" ||
              Boolean(row?.approved_at);
            setApproved(ok);
            setAppStatus(row?.application_status ?? (ok ? "approved" : "pending"));
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Force home on SIGNED_OUT
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") window.location.assign("/");
    });
    return () => {
      try { sub?.subscription?.unsubscribe(); } catch {}
    };
  }, []);

  // Single, fast loader
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        let mid = getCurrentMentorId();
        if (!mid || mid === "fallback") {
          mid = (await getMyMentorId()) || "";
          if (mid) setCurrentMentorId(mid);
        }
        if (!mid) return;
        // ✅ Fetch payout proofs for this mentor (bank details with proofs)
// In your fetchPayoutProofs function, add debugging:
const fetchPayoutProofs = async (mentorId: string) => {
  console.log("🔍 Fetching payout proofs for mentor:", mentorId);
  
  const { data: proofs, error } = await supabase
    .from("mentor_bank_details")
    .select(`
      id,
      created_at,
      status,
      payment_proof_path,
      amount,
      booking_id,
      booking:booking_id (
        mentee_name,
        mentee_email,
        session_amount
      )
    `)
    .eq("mentor_id", mentorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching payout proofs:", error);
    return;
  }

  console.log("🔍 Raw payout proofs data:", proofs);

  const merged = (proofs || []).map((p: any) => {
    const result = {
      id: p.id,
      created_at: p.created_at,
      status: p.status,
      payment_proof_path: p.payment_proof_path,
      booking_id: p.booking_id,
      client_name: p.booking?.mentee_name || p.booking?.mentee_email || "Unknown",
      session_amount: p.booking?.session_amount || p.amount || 0,
    };
    console.log("🔍 Processed payout proof:", result);
    return result;
  });

  setPayoutProofs(merged);
};


        const [mentorData, allBookings, pend, sl, upc] = await Promise.all([
          getMentor(mid),
          listBookings({ mentorId: mid }),
          listPendingRequestsForMentor(mid),
          listSlotsForMentor(mid),
          listUpcomingForMentor(mid),
        ]);

        if (!alive) return;

if (mentorData) {
  // 🧠 1️⃣ Make a copy
  const sanitized = { ...mentorData };

  // 🧠 2️⃣ If availability is "high" but the mentor hasn't actually set anything
  // (for example, weeklySchedule is empty), treat it as "not set"
  if (sanitized.availability === "high") {
    const noSchedule =
      !sanitized.weeklySchedule || sanitized.weeklySchedule.length === 0;

    if (noSchedule) {
      sanitized.availability = null;
    }
  }

  // ✅ Debug log (check browser console)
  console.log("✅ Final mentor availability:", sanitized.availability);

  // 🟡 NEW: Fetch mentor amount from mentors table
 const { data: mentorAmountRow, error: amountError } = await supabase
  .from("mentors")
  .select("amount")
  .eq("user_id", mentorData.user_id)   // ✅ CORRECT
  .maybeSingle();


  if (amountError) {
    console.error("Failed to fetch mentor amount:", amountError);
  } else {
    // Store this in a React state
    setMentorAmount(mentorAmountRow?.amount ?? 0);
    console.log("✅ Mentor amount set to:", mentorAmountRow?.amount ?? 0);
  }

  // 🧠 3️⃣ Save the sanitized object to state
  setMentor(sanitized);
  await fetchPayoutProofs(mid);

  setProfileData({
    name: sanitized.name,
    title: sanitized.title,
    company: sanitized.company,
  });
  setCurrency(sanitized.packages?.[0]?.currency ?? "USD");
  setPackagesState(
    sanitized.packages?.length
      ? sanitized.packages
      : [
          {
            id: "pkg30-ui",
            label: "30 min",
            minutes: 30,
            price: sanitized.price,
            currency: (sanitized.packages?.[0]?.currency ?? "USD") as any,
            active: true,
          },
          {
            id: "pkg45-ui",
            label: "45 min",
            minutes: 45,
            price: Math.round(sanitized.price * 1.3),
            currency: (sanitized.packages?.[0]?.currency ?? "USD") as any,
            active: true,
          },
          {
            id: "pkg60-ui",
            label: "60 min",
            minutes: 60,
            price: Math.round(sanitized.price * 1.6),
            currency: (sanitized.packages?.[0]?.currency ?? "USD") as any,
            active: true,
          },
        ]
  );
  setWeeklyEdit(sanitized.weeklySchedule ?? []);
  setBufferEdit(sanitized.bufferMinutes ?? 15);
}



       setBookings(allBookings);
        setPendingBookings(pend);
        setSlots(sl);

// ✅ Normalize Teams Join URL field for upcoming bookings
          const normalizedUpcoming = upc.map((b: any) => ({
            ...b,
            teamsJoinUrl: b.teamsJoinUrl || b.teams_join_url || b.meeting_link || null,
          }));
          setUpcoming(normalizedUpcoming);


        // earnings (local calc)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const completedOrConfirmed = allBookings.filter(b => b.status !== "cancelled");
        const mtdSum = completedOrConfirmed
          .filter(b => new Date(b.startIso) >= startOfMonth && new Date(b.startIso) <= now)
          .reduce((acc, b) => acc + (b.price || 0), 0);
        const lifeSum = completedOrConfirmed.reduce((acc, b) => acc + (b.price || 0), 0);
        const pendingSum = mentorAmount;

        const txRows = completedOrConfirmed.slice(-10).map(b => ({
          id: b.id,
          date: b.startIso,
          client: b.clientId,
          amount: b.price || 0,
          status: "paid" as const
        }));

        setMtd(mtdSum);
        setLifetime(lifeSum);
        setPending(pendingSum);
        setTx(txRows);
      } catch (e: any) {
        toast({ title: "Load failed", description: e?.message ?? "Please retry.", variant: "destructive" });
      }
    })();

    return () => { alive = false; };
  }, [toast]);

  const refreshAll = async (mid: string) => {
    const [allB, pendB, sl, upc] = await Promise.all([
      listBookings({ mentorId: mid }),
      listBookings({ mentorId: mid, status: "pending" as any }),
      listSlotsForMentor(mid),
      listUpcomingForMentor(mid),
    ]);
    setBookings(allB);
    setPendingBookings(pendB);
    setSlots(sl);
    setUpcoming(upc);
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    };
  };

  const getBookingSlot = (slotId: string) => slots.find(s => s.id === slotId);
  const getAvailableSlots = (excludeSlotId?: string) => slots.filter(s => s.available && s.id !== excludeSlotId);

  const isWithin24Hours = (slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return false;
    const now = new Date();
    const slotTime = new Date(slot.startIso);
    const hoursUntilSlot = (slotTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilSlot <= 24;
  };

  const handleReschedule = async () => {
    if (!selectedBooking || !newSlotId) return;
    const within24h = isWithin24Hours(selectedBooking.slotId);
    const reason = within24h ? rescheduleReason.trim() : undefined;

    try {
      await rescheduleBookingDb(selectedBooking.id, newSlotId, reason);
      toast({ title: "Session rescheduled!", description: "The mentee has been notified of the change." });
      if (mentor) await refreshAll(mentor.id);
      setSelectedBooking(null);
      setNewSlotId("");
      setRescheduleReason("");
    } catch (e: any) {
      toast({ title: "Reschedule failed", description: e?.message ?? "Please try another slot.", variant: "destructive" });
    }
  };

  const handleSaveProfile = () => {
    if (!mentor) return;
    updateMentorProfile(mentor.id, profileData);
    setMentor({ ...mentor, ...profileData });
    toast({ title: "Profile updated!", description: "Your profile information has been saved." });
    setEditProfileOpen(false);
  };

  const togglePackageActive = (minutes: 30|45|60, active: boolean) => {
    setPackagesState(prev => prev.map(p => p.minutes === minutes ? { ...p, active } : p));
  };
  const setPackagePrice = (minutes: 30|45|60, price: number) => {
    setPackagesState(prev => prev.map(p => p.minutes === minutes ? { ...p, price } : p));
  };
  const savePricing = () => {
    if (!mentor) return;
    const normalized = packagesState.map(p => ({
      ...p,
      currency: currency as any,
      label: p.label || `${p.minutes} min`,
      id: p.id || `pkg-${p.minutes}`
    }));
    updateMentorProfile(mentor.id, { packages: normalized });
    setMentor({ ...mentor, packages: normalized });
    toast({ title: "Pricing updated", description: "Your session packages were saved." });
  };

  const toggleDay = (weekday: number, active: boolean) => {
    setWeeklyEdit(prev => prev.map(s => s.weekday === weekday ? { ...s, active } : s));
  };
  const setTimeForDay = (weekday: number, key: "start" | "end", value: string) => {
    setWeeklyEdit(prev => prev.map(s => s.weekday === weekday ? { ...s, [key]: value } : s));
  };
  const saveAvailability = () => {
    if (!mentor) return;
    updateMentorProfile(mentor.id, { weeklySchedule: weeklyEdit, bufferMinutes: bufferEdit });
    setMentor({ ...mentor, weeklySchedule: weeklyEdit, bufferMinutes: bufferEdit });
    toast({ title: "Availability updated", description: "Your weekly schedule was saved." });
  };

  // Upcoming list preferring DB-backed rows; fallback to legacy local
  const legacyUpcoming = bookings.filter(b => {
    const slot = getBookingSlot(b.slotId);
    return b.status === "confirmed" && slot && new Date(slot.startIso) > new Date();
    });
  const upcomingBookings = (upcoming && upcoming.length > 0)
    ? upcoming.filter((b: any) => b.status === "confirmed" && new Date(b.startIso) > new Date())
    : legacyUpcoming;


const handleMentorReviewSubmit = async (bookingId: string, clientId: string) => {
  const text = reviewText[bookingId]?.trim();
  const rating = reviewRating[bookingId];

  if (!rating) {
    toast({ title: "Please select a rating", variant: "destructive" });
    return;
  }

  if (!text) {
    toast({ title: "Please enter a comment before submitting", variant: "destructive" });
    return;
  }

  const { data: sessionData } = await supabase.auth.getUser();
  const reviewerId = sessionData.user?.id;

  if (!reviewerId) {
    toast({ title: "You must be logged in to submit a review", variant: "destructive" });
    return;
  }

  const { error } = await supabase.from("mentor_reviews").insert([
    {
      booking_id: bookingId,
      mentor_id: mentor?.id,
      client_id: clientId,
      reviewer_id: reviewerId,
      given_by: "mentor",
      rating,
      comment: text,
    },
  ]);

  if (error) {
    console.error("[review insert] failed", error);
    toast({ title: "Failed to submit review", description: error.message, variant: "destructive" });
    return;
  }

  setReviewText((prev) => ({ ...prev, [bookingId]: "" }));
  setReviewRating((prev) => ({ ...prev, [bookingId]: 0 }));

  toast({ title: "Review submitted!", description: "Your feedback has been saved." });
};

const fetchClientFeedback = async (bookingId: string) => {
  console.log("[feedback] requesting for booking:", bookingId);
  const { data, error } = await supabase
    .from("mentor_reviews")
    .select("rating, comment")      // ← use 'comment' (not 'review_text')
    .eq("booking_id", bookingId)
    .eq("given_by", "client")
    .maybeSingle();

  if (error) {
    console.error("[feedback] error:", error);
    setClientFeedback(null);
    return;
  }

  console.log("[feedback] got:", data);
  setClientFeedback(
    data ? { rating: data.rating, text: data.comment ?? "" } : null
  );
};

const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
const [bankDetails, setBankDetails] = useState({
  bank_name: '',
  account_number: '',
  confirm_account_number: '',
  ifsc_code: '',
  branch: ''
});

const handleWithdrawSubmit = async () => {
  if (bankDetails.account_number !== bankDetails.confirm_account_number) {
    toast({ title: 'Error', description: 'Account numbers do not match!', variant: 'destructive' });
    return;
  }

  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session || !session.session.user) {
      toast({ title: 'Error', description: 'Mentor not authenticated!', variant: 'destructive' });
      return;
    }

    const mentorId = session.session.user.id;

    const { data: mentor, error: mentorError } = await supabase
      .from('mentors')
      .select('id, user_id, amount')
      .eq('user_id', mentorId)
      .maybeSingle();

    if (mentorError || !mentor) {
      console.error('Mentor error:', mentorError);
      toast({ title: 'Error', description: 'Mentor does not exist in the system!', variant: 'destructive' });
      return;
    }

    // ✅ Include the amount in the insert
    const { error } = await supabase
      .from('mentor_bank_details')
      .insert([
        {
          mentor_id: mentor.id,
          bank_name: bankDetails.bank_name,
          account_number: bankDetails.account_number,
          confirm_account_number: bankDetails.confirm_account_number,
          ifsc_code: bankDetails.ifsc_code,
          branch: bankDetails.branch,
          status: 'pending',
          amount: mentor.amount, // 🟡 This is the per-session amount
        }
      ]);

    if (error) throw error;

    toast({ title: 'Bank Details Submitted', description: 'Your withdrawal request is pending approval.' });
    setWithdrawDialogOpen(false);
    
    // Reset form
    setBankDetails({
      bank_name: '',
      account_number: '',
      confirm_account_number: '',
      ifsc_code: '',
      branch: ''
    });

  } catch (error: any) {
    toast({ title: 'Submission Failed', description: error.message, variant: 'destructive' });
  }
};




  // ✅ Approval gate UI
  if (loadingGate) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar unreadCount={unreadCount} />
        <div className="max-w-2xl mx-auto p-8">Loading…</div>
      </div>
    );
  }
  if (!approved) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar unreadCount={unreadCount}/>
        <div className="max-w-2xl mx-auto p-6">
          <Alert>
            <AlertTitle>Approval pending</AlertTitle>
            <AlertDescription>
              Your mentor application status: <b>{appStatus}</b>. You’ll get access to the mentor dashboard once an admin approves you.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <MentorGate>
      <div className="min-h-screen bg-background">
        <Navbar unreadCount={unreadCount} />

        <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {mentor ? `Welcome back, ${mentor.name}` : "Loading your dashboard…"}
                </h1>
                {mentor && <p className="text-muted-foreground">{mentor.title} at {mentor.company}</p>}
              </div>
              {mentor && (
                <div className="flex items-center gap-2">
                  {!approved ? (
                    <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300">⏳ Pending Approval</Badge>
                  ) : mentor.verified ? (
                    <Badge className="bg-verified-green text-white">✓ Verified</Badge>
                  ) : null}
                  <Badge variant="secondary">{mentor.rating} rating</Badge>
                  {unreadNotifications.length > 0 && (
                    <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
                  )}
                </div>
              )}
            </div>
<Tabs defaultValue="upcoming" className="space-y-6">
  <TabsList
     className="
    w-full mb-4
    px-2 sm:px-0
    flex flex-wrap sm:grid
    grid-cols-1 sm:grid-cols-4 lg:grid-cols-7
    gap-2
    h-auto sm:h-10
  "
  >
    <TabsTrigger className="w-full" value="requests">Requests</TabsTrigger>
    <TabsTrigger className="w-full" value="upcoming">Upcoming</TabsTrigger>
    <TabsTrigger className="w-full" value="past">Past</TabsTrigger>
    <TabsTrigger className="w-full" value="profile">Profile</TabsTrigger>
    <TabsTrigger className="w-full" value="availability">Availability</TabsTrigger>
    <TabsTrigger className="w-full" value="pricing">Pricing</TabsTrigger>
    <TabsTrigger className="w-full" value="earnings">Earnings</TabsTrigger>
  </TabsList>


              {/* Requests */}
              <TabsContent value="requests" className="px-2 sm:px-0">
                <Card>
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle>Booking Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pendingBookings.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No pending booking requests</p>
                        <p className="text-sm text-muted-foreground mt-2">New requests will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingBookings.map((b) => {
                          const slot = getBookingSlot(b.slotId) || slots.find(s => s.id === b.slotId);
                          const d = slot ? new Date(slot.startIso) : null;
                          const when = d
                            ? `${d.toLocaleDateString(undefined, { month: "short", day: "numeric", weekday: "short" })} · ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
                            : "(time not loaded)";

                          return (
                            <div key={b.id} className="p-4 border rounded flex items-start justify-between gap-4">
                              <div>
                                <div className="font-medium">
                                  {b.clientName || `Client: ${b.clientId}`}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {b.clientEmail || "—"}{b.clientPhone ? ` • ${b.clientPhone}` : ""}
                                </div>
                                <div className="text-sm text-muted-foreground">{when}</div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={async () => {
                                    try {
                                      // ✅ call RPC with the correct argument names + mentor user id
                                      const { data: { session } } = await supabase.auth.getSession();
                                      if (!session) throw new Error("User not authenticated");

                                      console.log("[confirm] booking id / user:", b.id, session.user.id);

                                      const { data, error } = await supabase.rpc("confirm_booking", {
                                        _booking_id: b.id,             // <-- correct param name
                                        _user_id: session.user.id,     // <-- pass mentor’s user id
                                      });
                                      if (error) throw error;

                                      // ✅ NEW: fire email via Edge Function (Session Confirmed → client)
                                      if (functionsUrl) {
                                        fetch(`${functionsUrl}/send-email`, {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ mode: "confirm", bookingId: b.id }),
                                        }).catch((err) => console.error("confirm email failed", err));
                                      }

                                      toast({ title: "Booking confirmed" });
                                      if (mentor) await refreshAll(mentor.id);
                                    } catch (e: any) {
                                      console.error("[confirm_booking] failed", e);
                                      toast({ title: "Confirm failed", description: e?.message ?? "Try again.", variant: "destructive" });
                                    }
                                  }}
                                >
                                  Confirm
                                </Button>

                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="destructive">Decline</Button>
                                  </DialogTrigger>
                                  <DialogContent aria-describedby={undefined}>
                                    <DialogHeader>
                                      <DialogTitle>Decline Booking</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-3">
                                      <p className="text-sm text-muted-foreground">
                                        Optionally add a note for the client:
                                      </p>
                                      <Textarea value={declineNote} onChange={(e) => setDeclineNote(e.target.value)} />
                                      <div className="flex gap-2 justify-end">
                                        <Button variant="outline" onClick={() => setDeclineNote("")}>Cancel</Button>
                                        <Button
                                          variant="destructive"
                                          onClick={async () => {
                                            try {
                                              await declineBookingDb(b.id, declineNote.trim() || undefined);

                                              // ✅ NEW: fire email via Edge Function (Session Cancelled → client)
                                              if (functionsUrl) {
                                                fetch(`${functionsUrl}/send-email`, {
                                                  method: "POST",
                                                  headers: { "Content-Type": "application/json" },
                                                  body: JSON.stringify({ mode: "cancel", bookingId: b.id }),
                                                }).catch((err) => console.error("cancel email failed", err));
                                              }

                                              setDeclineNote("");
                                              toast({ title: "Booking declined" });
                                              if (mentor) await refreshAll(mentor.id);
                                            } catch (e: any) {
                                              toast({ title: "Decline failed", description: e?.message ?? "Try again.", variant: "destructive" });
                                            }
                                          }}
                                        >
                                          Confirm decline
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Upcoming */}
              <TabsContent value="upcoming" className="px-2 sm:px-0">
                <Card>
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Upcoming Sessions ({upcomingBookings.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingBookings.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No upcoming sessions</p>
                        <p className="text-sm text-muted-foreground mt-2">New bookings will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                    {upcomingBookings.map((booking: any) => {
  const startIso: string =
    booking.startIso ||
    getBookingSlot(booking.slotId)?.startIso ||
    "";

  if (!startIso) return null;
  const date = new Date(startIso).toLocaleDateString(undefined, { month: "short", day: "numeric", weekday: "short" });
  const time = new Date(startIso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return (
    <div
      key={booking.id}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-border rounded-lg"
    >
      {/* Left section — client & time */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-medium">{booking.clientId}</h4>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {time}
            </span>
          </div>
        </div>
      </div>

      {/* Right section — status, Teams, reschedule */}
      <div className="flex items-center gap-2">
        <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
          {booking.status}
        </Badge>

        {/* ✅ Join on Teams button — shows only if confirmed & Teams URL exists */}
        {booking.status === "confirmed" && booking.teamsJoinUrl && (
          <a
            href={booking.teamsJoinUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-primary text-white text-sm px-3 py-1 rounded hover:bg-primary/90 transition-colors"
          >
            Join on Teams
          </a>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedBooking(booking)}
            >
              Reschedule
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Reschedule Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Current Session</Label>
                <p className="text-sm text-muted-foreground">
                  {booking.clientId} - {date} at {time}
                </p>
              </div>

              <div>
                <Label>New Time Slot</Label>
                <Select value={newSlotId} onValueChange={setNewSlotId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableSlots(booking.slotId).map((slot) => {
                      const d2 = new Date(slot.startIso);
                      const nd = d2.toLocaleDateString(undefined, { month: "short", day: "numeric", weekday: "short" });
                      const nt = d2.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
                      return (
                        <SelectItem key={slot.id} value={slot.id}>
                          {nd} at {nt}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {isWithin24Hours(booking.slotId) && (
                <div>
                  <Label>Reason (Required for last-minute changes)</Label>
                  <Textarea
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    placeholder="Please provide a reason for the reschedule..."
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleReschedule}
                  disabled={
                    !newSlotId ||
                    (isWithin24Hours(booking.slotId) && !rescheduleReason.trim())
                  }
                  className="flex-1"
                >
                  Confirm Reschedule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
})}

                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Past */}
{/* Past */}
<TabsContent value="past" className="px-2 sm:px-0">
  <Card>
    <CardHeader className="px-4 sm:px-6">
      <CardTitle>Past Sessions</CardTitle>
    </CardHeader>
    <CardContent>
      {bookings.filter(b => {
        const slot = getBookingSlot(b.slotId);
        return slot && new Date(slot.startIso) <= new Date();
      }).length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No past sessions yet.
        </div>
      ) : (
        <div className="space-y-3">
          {bookings
            .filter(b => {
              const slot = getBookingSlot(b.slotId);
              return slot && new Date(slot.startIso) <= new Date();
            })
            .map((b) => {
              const slot = getBookingSlot(b.slotId)!;
              const date = new Date(slot.startIso).toLocaleDateString(undefined, { month: "short", day: "numeric", weekday: "short" });
              const time = new Date(slot.startIso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

              return (
                <div key={b.id} className="p-4 border border-border rounded-lg space-y-3">
                  {/* Session details */}
                  <div className="text-sm mt-1">
                    💰 <span className="font-medium">Session Amount:</span> ${b.session_amount ?? 0}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{b.clientName || b.clientEmail || b.clientId}</div>
                      <div className="text-sm text-muted-foreground">{date} • {time}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={b.status === 'cancelled' ? 'secondary' : 'default'}>{b.status}</Badge>
                    </div>
                  </div>

                  {/* Mentor Review Box */}
                  <div className="border-t pt-3">
                    <label className="text-sm font-medium text-gray-800">Rate this client:</label>
                    <div className="flex items-center mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setReviewRating((prev) => ({ ...prev, [b.id]: star }))}
                          className={`mx-0.5 text-2xl ${
                            star <= (reviewRating[b.id] || 0)
                              ? "text-yellow-400"
                              : "text-gray-300 hover:text-yellow-300"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>

                    <Textarea
                      className="w-full mt-2 border rounded-md p-2 text-sm"
                      rows={2}
                      placeholder="Write your feedback..."
                      value={reviewText[b.id] || ""}
                      onChange={(e) =>
                        setReviewText((prev) => ({ ...prev, [b.id]: e.target.value }))
                      }
                    />

                    <Button
                      onClick={() => handleMentorReviewSubmit(b.id, b.clientId)}
                      className="mt-2 bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-primary/90"
                    >
                      Submit Review
                    </Button>
                  </div>

                  {/* Withdraw Earnings Button - ONLY in Past Sessions */}
                  <Button
                    onClick={() => {
                      setSelectedBooking(b); // Pass the session to the withdrawal form
                      setWithdrawDialogOpen(true); // Open the withdrawal dialog
                    }}
                    className="mt-2 bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-primary/90"
                  >
                    Withdraw Earnings
                  </Button>
                </div>
              );
            })}
        </div>
      )}
    </CardContent>
  </Card>

  {/* Withdrawal Dialog - MOVED INSIDE Past Sessions Tab */}
  <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
    <DialogContent aria-describedby={undefined}>
      <DialogHeader>
        <DialogTitle>Enter Bank Details for Withdrawal</DialogTitle>
      </DialogHeader>
      {selectedBooking && (
        <div className="mb-2 text-sm text-muted-foreground">
          Withdrawing for session amount: <span className="font-semibold">${selectedBooking.session_amount ?? 0}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label>Bank Name</Label>
          <Input 
            value={bankDetails.bank_name} 
            onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })} 
          />
        </div>
        <div>
          <Label>Account Number</Label>
          <Input 
            type="text" 
            value={bankDetails.account_number} 
            onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })} 
          />
        </div>
        <div>
          <Label>Confirm Account Number</Label>
          <Input 
            type="text" 
            value={bankDetails.confirm_account_number} 
            onChange={(e) => setBankDetails({ ...bankDetails, confirm_account_number: e.target.value })} 
          />
        </div>
        <div>
          <Label>IFSC Code</Label>
          <Input 
            value={bankDetails.ifsc_code} 
            onChange={(e) => setBankDetails({ ...bankDetails, ifsc_code: e.target.value })} 
          />
        </div>
        <div>
          <Label>Branch</Label>
          <Input 
            value={bankDetails.branch} 
            onChange={(e) => setBankDetails({ ...bankDetails, branch: e.target.value })} 
          />
        </div>
        <Button onClick={handleWithdrawSubmit}>Submit</Button>
      </div>
    </DialogContent>
  </Dialog>
</TabsContent>

              {/* Profile */}
              <TabsContent value="profile" className="px-2 sm:px-0">
                <Card>
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Profile Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {mentor && (
                      <>
                        <div className="flex items-center gap-4">
                          <img
                            src={mentor.avatar}
                            alt={mentor.name}
                            className="w-20 h-20 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="text-lg font-semibold">{mentor.name}</h3>
                            <p className="text-muted-foreground">{mentor.title}</p>
                            {!approved ? (
                              <Badge className="mt-1 bg-yellow-100 text-yellow-800 border border-yellow-300">⏳ Pending Approval</Badge>
                            ) : (
                              <Badge className="mt-1 bg-verified-green text-white">✓ Verified</Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-2">Profile Information</h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="font-medium">Name:</span> {mentor.name}</p>
                              <p><span className="font-medium">Title:</span> {mentor.title}</p>
                              <p><span className="font-medium">Company:</span> {mentor.company}</p>
                              <p><span className="font-medium">Experience:</span> {mentor.experience} years</p>
                              <p><span className="font-medium">Rating:</span> {mentor.rating}/5.0 ({mentor.reviews} reviews)</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Specialties</h4>
                            <div className="flex flex-wrap gap-2">
                              {mentor.specialties.map((specialty) => (
                                <Badge key={specialty} variant="secondary">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
                          <DialogTrigger asChild>
                            <Button>Edit Profile Details</Button>
                          </DialogTrigger>
                          <DialogContent aria-describedby={undefined}>
                            <DialogHeader>
                              <DialogTitle>Edit Profile</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                  id="name"
                                  value={profileData.name}
                                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="title">Title</Label>
                                <Input
                                  id="title"
                                  value={profileData.title}
                                  onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="company">Company</Label>
                                <Input
                                  id="company"
                                  value={profileData.company}
                                  onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                                />
                              </div>
                              <Button onClick={handleSaveProfile} className="w-full">
                                Save Changes
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Availability */}
              <TabsContent value="availability" className="px-2 sm:px-0">
                <h2 className="text-xl font-semibold mb-4">Availability Management</h2>
                {getCurrentMentorId() ? (
                  <AvailabilityCalendar mentorId={getCurrentMentorId()} />
                ) : (
                  <p className="text-sm text-muted-foreground">Loading mentor profile…</p>
                )}
              </TabsContent>

              {/* Pricing */}
              <TabsContent value="pricing" className="px-2 sm:px-0">
                <Card>
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle>Pricing & Packages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Currency</Label>
                      <Input value={currency} onChange={e => setCurrency(e.target.value.toUpperCase())} placeholder="USD / INR" />
                    </div>
                    {([30,45,60] as const).map(mins => {
                      const pkg = packagesState.find(p => p.minutes === mins) ||
                        { id: `pkg-${mins}`, label: `${mins} min`, minutes: mins, price: 0, currency: currency as any, active: false };
                      return (
                        <div key={mins} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-center">
                          <div className="text-sm font-medium">{mins} min</div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{pkg.active ? "Active" : "Inactive"}</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => togglePackageActive(mins as 30|45|60, !pkg.active)}
                            >
                              {pkg.active ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                          <div>
                            <Label>Price ({currency})</Label>
                            <Input
                              type="number"
                              min={0}
                              value={pkg.price}
                              onChange={e => setPackagePrice(mins as 30|45|60, parseFloat(e.target.value || "0"))}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex justify-end">
                      <Button onClick={savePricing}>Save Pricing</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

<TabsContent value="earnings" className="px-2 sm:px-0">
  <Card>
    <CardHeader>
      <CardTitle>Earnings & Payment Proofs</CardTitle>
    </CardHeader>
    <CardContent>
      {/* 📌 Payout Proofs Section - Updated to show client session amounts */}
      <div className="mt-6">
        <h4 className="font-medium mb-3">Payment Proofs & Session Details</h4>
        {payoutProofs.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No payment proofs uploaded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-2 pr-2">Date</th>
                  <th className="py-2 pr-2">Client</th>
                  <th className="py-2 pr-2">Session Amount</th>
                  <th className="py-2 pr-2">Proof</th>
                  <th className="py-2 pr-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {payoutProofs.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 pr-2">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 pr-2">{p.client_name}</td>
                    <td className="py-2 pr-2">${Number(p.session_amount).toFixed(2)}</td>
                    <td className="py-2 pr-2">
                      {p.payment_proof_path ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            const { data, error } = await supabase.storage
                              .from("payment_proofs")
                              .createSignedUrl(p.payment_proof_path, 300);
                            if (error || !data?.signedUrl) {
                              toast({ title: "Error opening proof", description: error?.message });
                              return;
                            }
                            window.open(data.signedUrl, "_blank");
                          }}
                        >
                          View Proof
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2 pr-2">
                      <Badge variant={p.status === "completed" ? "default" : "secondary"}>
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded-lg border">
          <div className="text-sm text-muted-foreground">Pending Payouts</div>
          <div className="text-2xl font-bold">${pending}</div>
        </div>
        <div className="p-4 rounded-lg border">
          <div className="text-sm text-muted-foreground">Month to date</div>
          <div className="text-2xl font-bold">${mtd}</div>
        </div>
        <div className="p-4 rounded-lg border">
          <div className="text-sm text-muted-foreground">Lifetime</div>
          <div className="text-2xl font-bold">${lifetime}</div>
        </div>
      </div>

     
    </CardContent>
  </Card>
</TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
    </MentorGate>
  );
};

export default MentorDashboard;
