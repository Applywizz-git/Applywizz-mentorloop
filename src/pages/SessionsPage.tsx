// // src/pages/SessionsPage.tsx
// import { useEffect, useState } from "react";
// import { Navbar } from "@/components/ui/navbar"; // Ensure this is the correct import path
// import { supabase } from "@/lib/supabase";
// import { listBookings } from "@/lib/data";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Calendar, Clock } from "lucide-react";
// import ReviewBox from "@/components/ReviewBox";

// const SessionsPage = () => {
//   const [bookings, setBookings] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [unreadCount, setUnreadCount] = useState(0); // Add unreadCount state
// useEffect(() => {
//   (async () => {
//     const { data: uinfo } = await supabase.auth.getUser();
//     const id = uinfo?.user?.id;
//     if (!id) {
//       setLoading(false);
//       return;
//     }

//     const rows = await listBookings({ clientId: id });

//     // 🧠 DEBUG START
//     console.log("📌 [SessionsPage] Raw bookings returned from listBookings:");
//     console.table(rows);

//     if (rows && rows.length > 0) {
//       console.log("🔍 [SessionsPage] First booking object structure:", rows[0]);
//     } else {
//       console.warn("⚠️ [SessionsPage] No bookings returned for clientId:", id);
//     }

//     rows.forEach((row: any, index: number) => {
//       console.log(
//         `#${index + 1} Booking ID: ${row.id}`,
//         "\nmentorId:", row.mentorId,
//         "\nmentorName:", row.mentorName,
//         "\nmentorEmail:", row.mentorEmail,
//         "\nclientId:", row.clientId,
//         "\nstartIso:", row.startIso
//       );
//     });
//     // 🧠 DEBUG END

//     setBookings(rows as any);
//     setLoading(false);

//     // Dummy notification count for now
//     const fetchedUnreadCount = 3;
//     setUnreadCount(fetchedUnreadCount);
//   })();
// }, []);


//   const future = bookings.filter(
//     (b) => b.status === "confirmed" && b.startIso && new Date(b.startIso) > new Date()
//   );
//   const past = bookings.filter((b) => b.startIso && new Date(b.startIso) <= new Date());

//   const fmt = (iso: string) => {
//     const d = new Date(iso);
//     return {
//       date: d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
//       time: d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
//     };
//   };

// return (
//   <div className="min-h-screen bg-background">
//     <Navbar unreadCount={unreadCount} />
//     <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">

//       {/* UPCOMING SESSIONS */}
//       <Card>
//         <CardHeader>
//           <CardTitle>
//             Upcoming Sessions {loading ? "" : `(${future.length})`}
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <p className="text-sm text-muted-foreground">Loading…</p>
//           ) : future.length === 0 ? (
//             <p className="text-sm text-muted-foreground">No upcoming sessions.</p>
//           ) : (
//             future.map((b) => {
//               const f = fmt(b.startIso);
//               return (
//                 <div
//                   key={b.id}
//                   className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 border rounded mb-2"
//                 >
//                   {/* LEFT: Mentor + Date Time */}
//                   <div className="flex flex-col gap-1 text-sm text-muted-foreground">
//                     <div className="font-medium text-gray-900">
//                       Mentor: {b.mentorName ?? "—"}
//                     </div>
//                     {b.mentorEmail && (
//                       <div className="text-xs text-gray-500">{b.mentorEmail}</div>
//                     )}
//                     <div className="flex gap-4 mt-1">
//                       <span className="flex items-center gap-1">
//                         <Calendar className="w-4 h-4" /> {f.date}
//                       </span>
//                       <span className="flex items-center gap-1">
//                         <Clock className="w-4 h-4" /> {f.time}
//                       </span>
//                     </div>
//                   </div>

//                   {/* RIGHT: Status + Teams */}
//                   <div className="flex items-center gap-2 mt-2 sm:mt-0">
//                     <Badge>{b.status}</Badge>
//                     {b.status === "confirmed" && b.teamsJoinUrl && (
//                       <a
//                         href={b.teamsJoinUrl}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="aw-btn-primary text-sm px-3 py-1 rounded"
//                       >
//                         Join on Teams
//                       </a>
//                     )}
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </CardContent>
//       </Card>

//       {/* PAST SESSIONS */}
//       <Card>
//         <CardHeader>
//           <CardTitle>
//             Past Sessions {loading ? "" : `(${past.length})`}
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <p className="text-sm text-muted-foreground">Loading…</p>
//           ) : past.length === 0 ? (
//             <p className="text-sm text-muted-foreground">No past sessions yet.</p>
//           ) : (
//             past.map((b) => {
//               const f = fmt(b.startIso);
//               return (
//                 <div
//                   key={b.id}
//                   className="p-3 border rounded mb-3 space-y-2"
//                 >
//                   {/* TOP: Mentor + Date Time */}
//                   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
//                     <div>
//                       <div className="font-medium text-gray-900">
//                         Mentor: {b.mentorName ?? "—"}
//                       </div>
//                       {b.mentorEmail && (
//                         <div className="text-xs text-gray-500">{b.mentorEmail}</div>
//                       )}
//                       <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
//                         <span className="flex items-center gap-1">
//                           <Calendar className="w-4 h-4" /> {f.date}
//                         </span>
//                         <span className="flex items-center gap-1">
//                           <Clock className="w-4 h-4" /> {f.time}
//                         </span>
//                       </div>
//                     </div>
//                     <Badge>{b.status}</Badge>
//                   </div>

//                   {/* REVIEW BOX */}
//                   <ReviewBox bookingId={b.id} mentorId={b.mentorId} />
//                 </div>
//               );
//             })
//           )}
//         </CardContent>
//       </Card>
//       </div>
//     </div>
//   );
// };

// export default SessionsPage;


import { useEffect, useState } from "react";
import { Navbar } from "@/components/ui/navbar"; // Ensure this is the correct import path
import { supabase } from "@/lib/supabase";
import { listBookings } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import ReviewBox from "@/components/ReviewBox";

const SessionsPage = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0); // Add unreadCount state
  const [currentMentor, setCurrentMentor] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  // For managing withdraw form visibility and details
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null); // For storing selected session
  const [withdrawalDetails, setWithdrawalDetails] = useState({
    name: "",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    branch: ""
  });

  useEffect(() => {
    (async () => {
      const { data: uinfo } = await supabase.auth.getUser();
      const id = uinfo?.user?.id;
      if (!id) {
        setLoading(false);
        return;
      }
      // ✅ Fetch user's role from "users" or "profiles" table
      const { data: roleData, error: roleError } = await supabase
        .from("users") // change to "profiles" if your table name is different
        .select("role")
        .eq("id", id)
        .maybeSingle();

      if (roleError) {
        console.error("Error fetching role:", roleError.message);
      }

      // Save the role
      setCurrentRole(roleData?.role || "client");

      const rows = await listBookings({ clientId: id });

      console.log("📌 [SessionsPage] Raw bookings returned from listBookings:");
      console.table(rows);

      setBookings(rows as any);
      setLoading(false);

      // Dummy notification count for now
      const fetchedUnreadCount = 3;
      setUnreadCount(fetchedUnreadCount);
    })();
  }, []);

  const future = bookings.filter(
    (b) => b.status === "confirmed" && b.startIso && new Date(b.startIso) > new Date()
  );
  const past = bookings.filter((b) => b.startIso && new Date(b.startIso) <= new Date());

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
      time: d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    };
  };

  const handleWithdraw = (session) => {
  setShowWithdrawForm(true);
  // Pre-fill session amount in the form (optional)
  setWithdrawalDetails((prev) => ({
    ...prev,
    amount: session.amount,
  }));
};

  const handleFormSubmit = async () => {
    const { name, bankName, accountNumber, confirmAccountNumber, ifscCode, branch } = withdrawalDetails;

    // Check if the form is valid
    if (accountNumber !== confirmAccountNumber) {
      alert("Account numbers don't match!");
      return;
    }

   try {
  // ✅ Fetch the latest mentor amount from mentors table
  const { data: mentorRow, error: mentorError } = await supabase
    .from("mentors")
    .select("amount")
    .eq("id", currentMentor.id)
    .maybeSingle();

  if (mentorError || !mentorRow) {
    throw new Error("Unable to fetch mentor's amount for withdrawal");
  }

  const { error } = await supabase
    .from("withdrawal_requests")
    .insert([
      {
        mentor_id: currentMentor.id,
        amount: mentorRow.amount,               // ✅ use mentor amount directly
        name,
        bank_name: bankName,
        account_number: accountNumber,
        confirm_account_number: confirmAccountNumber,
        ifsc_code: ifscCode,
        branch,
        session_id: selectedSession.id,
        status: "pending",
      },
    ]);

  if (error) {
    throw new Error(error.message);
  }


      alert('Withdrawal request submitted successfully!');
      setShowWithdrawForm(false);  // Close the form after submission
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar unreadCount={unreadCount} />
      <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">
        {/* UPCOMING SESSIONS */}
        <Card>
          <CardHeader>
            <CardTitle>
              Upcoming Sessions {loading ? "" : `(${future.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : future.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming sessions.</p>
            ) : (
              future.map((b) => {
                const f = fmt(b.startIso);
                return (
                  <div
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 border rounded mb-2"
                  >
                    {/* LEFT: Mentor + Date Time */}
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <div className="font-medium text-gray-900">
                        Mentor: {b.mentorName ?? "—"}
                      </div>
                      {b.mentorEmail && (
                        <div className="text-xs text-gray-500">{b.mentorEmail}</div>
                      )}
                      <div className="flex gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> {f.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {f.time}
                        </span>
                      </div>
                    </div>

                    {/* RIGHT: Status + Teams */}
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <Badge>{b.status}</Badge>
                      {b.status === "confirmed" && b.teamsJoinUrl && (
                        <a
                          href={b.teamsJoinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="aw-btn-primary text-sm px-3 py-1 rounded"
                        >
                          Join on Teams
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* PAST SESSIONS */}
        <Card>
          <CardHeader>
            <CardTitle>
              Past Sessions {loading ? "" : `(${past.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : past.length === 0 ? (
              <p className="text-sm text-muted-foreground">No past sessions yet.</p>
            ) : (
            past.map((b) => {
  const f = fmt(b.startIso);
  return (
    <div key={b.id} className="p-3 border rounded mb-3 space-y-2">
      {/* TOP: Mentor + Date Time */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <div className="font-medium text-gray-900">
            Mentor: {b.mentorName ?? "—"}
          </div>
          {b.mentorEmail && (
            <div className="text-xs text-gray-500">{b.mentorEmail}</div>
          )}
          <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {f.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {f.time}
            </span>
          </div>
        </div>
        <Badge>{b.status}</Badge>
      </div>
{/* Session Amount — show only for mentors */}
{currentRole === "mentor" && (
  <div className="text-sm text-muted-foreground">
    <span>Amount: ${b.amount}</span>
  </div>
)}


      {/* Withdraw Button */}
      {/* Withdraw Button - Only show for mentors */}
      {currentRole === "mentor" && (
        <button
          onClick={() => handleWithdraw(b)}
          className="text-white bg-blue-500 rounded px-4 py-2 mt-2 hover:bg-blue-600 transition"
        >
          Withdraw
        </button>
      )}


      {/* REVIEW BOX */}
      <ReviewBox bookingId={b.id} mentorId={b.mentorId} />
    </div>
  );
})

            )}
          </CardContent>
        </Card>

        {/* Withdrawal Form (conditionally rendered) */}
        {showWithdrawForm && (
          <div className="withdrawal-form">
            <h3>Enter Bank Details to Withdraw</h3>
            <form onSubmit={handleFormSubmit}>
              <label>Name</label>
              <input
                type="text"
                value={withdrawalDetails.name}
                onChange={(e) =>
                  setWithdrawalDetails({ ...withdrawalDetails, name: e.target.value })
                }
                required
              />
              <label>Bank Name</label>
              <input
                type="text"
                value={withdrawalDetails.bankName}
                onChange={(e) =>
                  setWithdrawalDetails({
                    ...withdrawalDetails,
                    bankName: e.target.value,
                  })
                }
                required
              />
              <label>Account Number</label>
              <input
                type="text"
                value={withdrawalDetails.accountNumber}
                onChange={(e) =>
                  setWithdrawalDetails({
                    ...withdrawalDetails,
                    accountNumber: e.target.value,
                  })
                }
                required
              />
              <label>Confirm Account Number</label>
              <input
                type="text"
                value={withdrawalDetails.confirmAccountNumber}
                onChange={(e) =>
                  setWithdrawalDetails({
                    ...withdrawalDetails,
                    confirmAccountNumber: e.target.value,
                  })
                }
                required
              />
              <label>IFSC Code</label>
              <input
                type="text"
                value={withdrawalDetails.ifscCode}
                onChange={(e) =>
                  setWithdrawalDetails({
                    ...withdrawalDetails,
                    ifscCode: e.target.value,
                  })
                }
                required
              />
              <label>Branch</label>
              <input
                type="text"
                value={withdrawalDetails.branch}
                onChange={(e) =>
                  setWithdrawalDetails({
                    ...withdrawalDetails,
                    branch: e.target.value,
                  })
                }
                required
              />
              <button type="submit">Submit Withdrawal</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsPage;
