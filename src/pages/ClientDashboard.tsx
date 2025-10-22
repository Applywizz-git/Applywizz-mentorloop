// import { useState, useEffect, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Navbar } from "@/components/ui/navbar";  // Import Navbar
// import { MentorCard } from "@/components/mentor-card";
// import { Search } from "lucide-react";
// import { listApprovedMentors } from "@/lib/data";
// import { Mentor } from "@/lib/types";
// import { setPostAuthAction } from "@/lib/auth";
// import { useAuthUser } from "@/hooks/useAuthUser";
// import { fetchUnreadNotifications, markNotificationAsRead } from "@/lib/notificationUtils"; // New function to fetch notifications

// function toTitleCase(label: string) {
//   return label
//     .split(" ")
//     .filter(Boolean)
//     .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
//     .join(" ");
// }

// const ClientDashboard = () => {
//   const [mentors, setMentors] = useState<Mentor[]>([]);
//   const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
//   const [unreadNotifications, setUnreadNotifications] = useState<any[]>([]); // Track unread notifications
//   const [unreadCount, setUnreadCount] = useState<number>(0); // Track the count of unread notifications
//   const [userId, setUserId] = useState<string>(''); 

//   // Filters (apply ONLY when user types in search)
//   const [searchQuery, setSearchQuery] = useState("");
//   const [domainFilter, setDomainFilter] = useState("all");
//   const [experienceFilter, setExperienceFilter] = useState("all");
//   const [priceRange, setPriceRange] = useState<string>("0-null"); // "min-max" (max can be "null")
//   const [languageFilter, setLanguageFilter] = useState<string>("all");

//   const navigate = useNavigate();
//   const { user } = useAuthUser();

//   // 🔹 1) Fetch approved mentors once on mount
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const all = await listApprovedMentors();
//         if (!mounted) return;
//         console.info("[ClientDashboard] mentors loaded:", all.length);
//         setMentors(all);
//         setFilteredMentors(all); // show all by default
//       } catch (e) {
//         console.error("Failed to load mentors", e);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // 🔹 Build normalized language list from data (deduped, lowercase values for filtering)
//   const availableLanguages = useMemo(() => {
//     const s = new Set<string>();
//     mentors.forEach((m: any) => {
//       const langs: string[] = Array.isArray(m.languages) ? m.languages : [];
//       langs.forEach((l) => {
//         if (typeof l === "string" && l.trim()) {
//           s.add(l.trim().toLowerCase());
//         }
//       });
//     });
//     return Array.from(s).sort(); // keep lowercase values for <SelectItem value>
//   }, [mentors]);

//   // 🔹 2) Apply search + filters ONLY when user types something in search
//   useEffect(() => {
//     const term = searchQuery.trim().toLowerCase();

//     if (!term) {
//       // No search => show all approved mentors
//       setFilteredMentors(mentors);
//       return;
//     }

//     let filtered = mentors.slice();

//     // Search: name, title (designation), company
//     filtered = filtered.filter((m: any) => {
//       const name = (m.name ?? "").toLowerCase();
//       const title = (m.title ?? "").toLowerCase();
//       const company = (m.company ?? "").toLowerCase();
//       return name.includes(term) || title.includes(term) || company.includes(term);
//     });

//     // Domain
//     if (domainFilter !== "all") {
//       const d = domainFilter.toLowerCase();
//       filtered = filtered.filter((m: any) => {
//         const specs: string[] = Array.isArray(m.specialties) ? m.specialties : [];
//         return (
//           specs.some((s) => (s ?? "").toLowerCase().includes(d)) ||
//           (m.title ?? "").toLowerCase().includes(d)
//         );
//       });
//     }

//     // Experience: "0-3", "4-7", "8-12", "13"
//     if (experienceFilter !== "all") {
//       const [min, max] = experienceFilter.split("-").map(Number);
//       filtered = filtered.filter((m: any) => {
//         const exp = Number(m.experience ?? (m as any).yearsOfExperience ?? 0);
//         return Number.isFinite(max) ? exp >= min && exp <= max : exp >= min;
//       });
//     }

//     // Price (dropdown)
//     if (priceRange !== "0-null") {
//       const [minStr, maxStr] = priceRange.split("-");
//       const min = Number(minStr);
//       const max = maxStr === "null" ? null : Number(maxStr);
//       filtered = filtered.filter((m: any) => {
//         const price = Number(m.price ?? 0);
//         return max === null ? price >= min : price >= min && price <= max;
//       });
//     }

//     // Language (normalized to lowercase)
//     if (languageFilter !== "all") {
//       const lang = languageFilter.toLowerCase();
//       filtered = filtered.filter((m: any) => {
//         const langs: string[] = Array.isArray(m.languages) ? m.languages : [];
//         return langs.map((l) => (l ?? "").toLowerCase()).includes(lang);
//       });
//     }

//     setFilteredMentors(filtered);
//     console.info("[ClientDashboard] filteredMentors:", filtered.length, filtered);
//   }, [mentors, searchQuery, domainFilter, experienceFilter, priceRange, languageFilter]);

//   // 🔹 Fetch unread notifications
//   useEffect(() => {
//     if (user?.id) {
//       const fetchNotifications = async () => {
//         const notifications = await fetchUnreadNotifications(user.id);  // Fetch unread notifications
//         setUnreadNotifications(notifications);  // Set the unread notifications
//         setUnreadCount(notifications.length);  // Update the unread notification count
//       };
//       fetchNotifications();  // Execute the function
//     }
//   }, [user]);

//   const handleViewProfile = (mentorId: string) => {
//     navigate(`/mentor/${mentorId}`);
//   };

//   // ✅ Book Session should use the same working flow as "View Profile → Book"
//   const handleBookSession = (id: string) => {
//     if (!user?.id) {
//       setPostAuthAction({ type: "resume_booking", mentorId: id });
//       navigate("/login");
//       return;
//     }
//     navigate(`/mentor/${id}?tab=availability`);
//   };

//   // Selected price text
//   const priceText = useMemo(() => {
//     const [minStr, maxStr] = priceRange.split("-");
//     if (minStr === "0" && maxStr === "null") return "All Prices";
//     if (maxStr === "null") return `$${minStr}+`;
//     return `$${minStr} – $${maxStr}`;
//   }, [priceRange]);

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Pass unreadCount to Navbar */}
//       <Navbar unreadCount={unreadCount} /> 

//       <div className="px-6 py-8">
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-foreground mb-2">Find Your Perfect Mentor</h1>
//             <p className="text-muted-foreground">
//               Browse our verified mentors and book a session that fits your career goals
//             </p>
//           </div>

//           {/* Filters */}
//           <div className="flex flex-col md:flex-row gap-4 mb-2">
//             {/* Search */}
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
//               <Input
//                 placeholder="Search by name, designation, or company…"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>

//             {/* Domain */}
//             <Select value={domainFilter} onValueChange={setDomainFilter}>
//               <SelectTrigger className="w-full md:w-48">
//                 <SelectValue placeholder="Domain" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Domains</SelectItem>
//                 <SelectItem value="product">Product Management</SelectItem>
//                 <SelectItem value="engineering">Engineering</SelectItem>
//                 <SelectItem value="marketing">Marketing</SelectItem>
//                 <SelectItem value="design">Design</SelectItem>
//               </SelectContent>
//             </Select>

//             {/* Experience */}
//             <Select value={experienceFilter} onValueChange={setExperienceFilter}>
//               <SelectTrigger className="w-full md:w-48">
//                 <SelectValue placeholder="Experience" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Experience</SelectItem>
//                 <SelectItem value="0-3">0-3 years</SelectItem>
//                 <SelectItem value="4-7">4-7 years</SelectItem>
//                 <SelectItem value="8-12">8-12 years</SelectItem>
//                 <SelectItem value="13">13+ years</SelectItem>
//               </SelectContent>
//             </Select>

//             {/* Price Range (Dropdown) */}
//             <Select value={priceRange} onValueChange={setPriceRange}>
//               <SelectTrigger className="w-full md:w-48">
//                 <SelectValue placeholder="Price Range" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="0-null">All Prices</SelectItem>
//                 <SelectItem value="0-500">$0 - $500</SelectItem>
//                 <SelectItem value="500-1000">$500 - $1000</SelectItem>
//                 <SelectItem value="1000-2000">$1000 - $2000</SelectItem>
//                 <SelectItem value="2000-null">$2000+</SelectItem>
//               </SelectContent>
//             </Select>

//             {/* Language (values are lowercase; labels are Title Case) */}
//             <Select value={languageFilter} onValueChange={setLanguageFilter}>
//               <SelectTrigger className="w-full md:w-48">
//                 <SelectValue placeholder="Language" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Languages</SelectItem>
//                 {availableLanguages.map((l) => (
//                   <SelectItem key={l} value={l}>
//                     {toTitleCase(l)}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Selected Price + Count */}
//           <div className="mb-6">
//             <p className="text-sm text-muted-foreground">Price filter: {priceText}</p>
//             <p className="text-muted-foreground">
//               Showing {filteredMentors.length} of {mentors.length} mentors
//             </p>
//           </div>

//           {/* Mentor Grid */}
//         <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
//   {filteredMentors.map((mentor, i) => (
//     <MentorCard
//       key={mentor.id}
//       mentor={mentor}
//       index={i}  // 👈 added index for alternating background / styling
//       onViewProfile={handleViewProfile}
//       onBookSession={handleBookSession}
//     />
//   ))}
// </div>


//           {filteredMentors.length === 0 && (
//             <div className="text-center py-12">
//               <p className="text-muted-foreground">No mentors found matching your criteria.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ClientDashboard;

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/ui/navbar"; // Import Navbar
import { MentorCard } from "@/components/mentor-card";
import { Search } from "lucide-react";
import { listApprovedMentors } from "@/lib/data";
import { Mentor } from "@/lib/types";
import { setPostAuthAction } from "@/lib/auth";
import { useAuthUser } from "@/hooks/useAuthUser";
import {
  fetchUnreadNotifications,
} from "@/lib/notificationUtils"; // New function to fetch notifications
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";


function toTitleCase(label: string) {
  return label
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const ClientDashboard = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [userId, setUserId] = useState<string>("");
  const { toast } = useToast();
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [priceRange, setPriceRange] = useState<string>("0-null");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  // 📝 Client feedback state
const [clientReviewText, setClientReviewText] = useState<{ [bookingId: string]: string }>({});
const [clientReviewRating, setClientReviewRating] = useState<{ [bookingId: string]: number }>({});
const [submittedReviews, setSubmittedReviews] = useState<{ [bookingId: string]: boolean }>({});
// ✅ Page-level loading for mentor fetch
const [isMentorListLoading, setIsMentorListLoading] = useState(true);

  // ✅ Added loading state for View Profile
  const [loadingMentorId, setLoadingMentorId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user } = useAuthUser();

  // 🔹 1) Fetch approved mentors once on mount
useEffect(() => {
  let mounted = true;

  (async () => {
    try {
        setIsMentorListLoading(true);
      const all = await listApprovedMentors();
      if (!mounted) return;

      // 🟡 STEP 1: Map `amount` → `session_amount`
     const allWithSessionAmount = all.map((m: any) => ({ ...m }));

      // 🧠 STEP 2: Normalize availability and weeklySchedule
      const sanitized = allWithSessionAmount.map((m: any) => {
        let schedule = m.weeklySchedule;

        // Handle if schedule is a string (Supabase can return JSON as text)
        if (typeof schedule === "string") {
          try {
            schedule = JSON.parse(schedule);
          } catch {
            schedule = [];
          }
        }

        const hasSchedule = Array.isArray(schedule) && schedule.length > 0;

        // Case 1: Fake default "high" but no schedule → null it out
        if (m.availability === "high" && !hasSchedule) {
          return { ...m, weeklySchedule: schedule, availability: null };
        }

        // Case 2: Schedule exists but availability not set → treat as "high"
        if ((!m.availability || m.availability.trim?.() === "") && hasSchedule) {
          return { ...m, weeklySchedule: schedule, availability: "high" };
        }

        return { ...m, weeklySchedule: schedule };
      });

      setMentors(sanitized);
      setFilteredMentors(sanitized);
    } catch (e) {
      console.error("Failed to load mentors", e);
    } finally {
      setIsMentorListLoading(false); // 👈 stop loading after fetch
    }
  })();

  return () => {
    mounted = false;
  };
}, []);


  // 🔹 Build normalized language list from data
  const availableLanguages = useMemo(() => {
    const s = new Set<string>();
    mentors.forEach((m: any) => {
      const langs: string[] = Array.isArray(m.languages) ? m.languages : [];
      langs.forEach((l) => {
        if (typeof l === "string" && l.trim()) {
          s.add(l.trim().toLowerCase());
        }
      });
    });
    return Array.from(s).sort();
  }, [mentors]);

  // 🔹 2) Apply search + filters
  useEffect(() => {
    const term = searchQuery.trim().toLowerCase();

    if (!term) {
      setFilteredMentors(mentors);
      return;
    }

    let filtered = mentors.slice();

    // Search: name, title, company
    filtered = filtered.filter((m: any) => {
      const name = (m.name ?? "").toLowerCase();
      const title = (m.title ?? "").toLowerCase();
      const company = (m.company ?? "").toLowerCase();
      return name.includes(term) || title.includes(term) || company.includes(term);
    });

    // Domain
    if (domainFilter !== "all") {
      const d = domainFilter.toLowerCase();
      filtered = filtered.filter((m: any) => {
        const specs: string[] = Array.isArray(m.specialties) ? m.specialties : [];
        return (
          specs.some((s) => (s ?? "").toLowerCase().includes(d)) ||
          (m.title ?? "").toLowerCase().includes(d)
        );
      });
    }

    // Experience
    if (experienceFilter !== "all") {
      const [min, max] = experienceFilter.split("-").map(Number);
      filtered = filtered.filter((m: any) => {
        const exp = Number(m.experience ?? (m as any).yearsOfExperience ?? 0);
        return Number.isFinite(max) ? exp >= min && exp <= max : exp >= min;
      });
    }

    // Price
    if (priceRange !== "0-null") {
      const [minStr, maxStr] = priceRange.split("-");
      const min = Number(minStr);
      const max = maxStr === "null" ? null : Number(maxStr);
      filtered = filtered.filter((m: any) => {
        const price = Number(m.price ?? 0);
        return max === null ? price >= min : price >= min && price <= max;
      });
    }

    // Language
    if (languageFilter !== "all") {
      const lang = languageFilter.toLowerCase();
      filtered = filtered.filter((m: any) => {
        const langs: string[] = Array.isArray(m.languages) ? m.languages : [];
        return langs.map((l) => (l ?? "").toLowerCase()).includes(lang);
      });
    }

    setFilteredMentors(filtered);
    console.info("[ClientDashboard] filteredMentors:", filtered.length, filtered);
  }, [mentors, searchQuery, domainFilter, experienceFilter, priceRange, languageFilter]);

  // 🔹 Fetch unread notifications
  useEffect(() => {
    if (user?.id) {
      const fetchNotifications = async () => {
        const notifications = await fetchUnreadNotifications(user.id);
        setUnreadNotifications(notifications);
        setUnreadCount(notifications.length);
      };
      fetchNotifications();
    }
  }, [user]);

  // ✅ View Profile with loading state
  const handleViewProfile = (mentorId: string) => {
    setLoadingMentorId(mentorId);
    navigate(`/mentor/${mentorId}`);
  };

  // ✅ Book Session
  const handleBookSession = (id: string) => {
    if (!user?.id) {
      setPostAuthAction({ type: "resume_booking", mentorId: id });
      navigate("/login");
      return;
    }
    navigate(`/mentor/${id}?tab=availability`);
  };

  // Price text
  const priceText = useMemo(() => {
    const [minStr, maxStr] = priceRange.split("-");
    if (minStr === "0" && maxStr === "null") return "All Prices";
    if (maxStr === "null") return `$${minStr}+`;
    return `$${minStr} – $${maxStr}`;
  }, [priceRange]);

  const handleClientReviewSubmit = async (booking: any) => {
  const rating = clientReviewRating[booking.id] || 0;
  const text = clientReviewText[booking.id] || "";

  if (rating === 0) {
    toast({ title: "Please select a rating before submitting.", variant: "destructive" });
    return;
  }

  try {
    const { error } = await supabase.from("mentor_reviews").insert({
      booking_id: booking.id,
      mentor_id: booking.mentorId,
      client_id: booking.clientId,
      given_by: "client",
      rating,
      review_text: text,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    toast({ title: "Review submitted successfully!" });

    setSubmittedReviews((prev) => ({ ...prev, [booking.id]: true }));
  } catch (e: any) {
    console.error("Client review submit failed", e);
    toast({ title: "Submit failed", description: e.message ?? "Try again", variant: "destructive" });
  }
};

  return (
    <div className="min-h-screen bg-background">
      <Navbar unreadCount={unreadCount} />

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">

          {/* ✅ Filters & Header wrapped in card container */}
          <div className="bg-card rounded-2xl shadow-sm border border-border/40 p-6 mb-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Find Your Perfect Mentor
              </h1>
              <p className="text-muted-foreground">
                Browse our verified mentors and book a session that fits your career goals
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name, designation, or company…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Domain */}
              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  <SelectItem value="product">Product Management</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                </SelectContent>
              </Select>

              {/* Experience */}
              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Experience</SelectItem>
                  <SelectItem value="0-3">0-3 years</SelectItem>
                  <SelectItem value="4-7">4-7 years</SelectItem>
                  <SelectItem value="8-12">8-12 years</SelectItem>
                  <SelectItem value="13">13+ years</SelectItem>
                </SelectContent>
              </Select>

              {/* Price */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-null">All Prices</SelectItem>
                  <SelectItem value="0-500">$0 - $500</SelectItem>
                  <SelectItem value="500-1000">$500 - $1000</SelectItem>
                  <SelectItem value="1000-2000">$1000 - $2000</SelectItem>
                  <SelectItem value="2000-null">$2000+</SelectItem>
                </SelectContent>
              </Select>

              {/* Language */}
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {availableLanguages.map((l) => (
                    <SelectItem key={l} value={l}>
                      {toTitleCase(l)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price + Count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">Price filter: {priceText}</p>
            <p className="text-muted-foreground">
              Showing {filteredMentors.length} of {mentors.length} mentors
            </p>
          </div>

          {/* Mentor Grid */}
         {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">  
  {filteredMentors.map((mentor, i) => {
    console.log("[MentorCard render]", mentor.name, mentor.availability, mentor.weeklySchedule);
    return (
      <MentorCard
        key={mentor.id}
        mentor={mentor}
        index={i}
        onViewProfile={handleViewProfile}
        onBookSession={handleBookSession}
        isLoading={loadingMentorId === mentor.id}
      />
    );
  })}
</div>



          {filteredMentors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No mentors found matching your criteria.
              </p>
            </div>
          )} */}
          {/* Mentor Grid or Loading */}
{isMentorListLoading ? (
  // ✅ Skeleton loader while fetching mentors
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="w-full h-48 bg-gray-100 rounded-xl animate-pulse border border-gray-200"
      >
        <div className="p-4 space-y-3">
          <div className="h-5 w-1/3 bg-gray-300 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
) : filteredMentors.length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {filteredMentors.map((mentor, i) => (
      <MentorCard
        key={mentor.id}
        mentor={mentor}
        index={i}
        onViewProfile={handleViewProfile}
        onBookSession={handleBookSession}
        isLoading={loadingMentorId === mentor.id}
      />
    ))}
  </div>
) : (
  <div className="text-center py-12">
    <p className="text-muted-foreground">
      No mentors found matching your criteria.
    </p>
  </div>
)}

        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
