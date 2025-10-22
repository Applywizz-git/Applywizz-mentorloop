// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Star, Building, Clock } from "lucide-react";
// import { Mentor } from "@/lib/types";

// interface MentorCardProps {
//   mentor: Mentor; // Use the Mentor interface here
//   onViewProfile: (id: string) => void;
//   onBookSession: (id: string) => void;
// }

// export const MentorCard = ({ mentor, onViewProfile, onBookSession }: MentorCardProps) => {
//   const getAvailabilityColor = (availability: string) => {
//     switch (availability) {
//       case 'high': return 'bg-verified-green';
//       case 'medium': return 'bg-yellow-500';
//       case 'low': return 'bg-orange-500';
//       default: return 'bg-gray-500';
//     }
//   };

//   const getAvailabilityText = (availability: string) => {
//     switch (availability) {
//       case 'high': return 'Available this week';
//       case 'medium': return 'Limited availability';
//       case 'low': return 'Busy this week';
//       default: return 'Check availability';
//     }
//   };

// return (
//  <Card
//   className="bg-white border border-neutral-200 shadow-[0_4px_16px_-6px_rgba(0,0,0,0.12)] 
//              hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.15)] 
//              hover:-translate-y-1 transition-all duration-300 rounded-2xl p-5 cursor-pointer"
// >

//     <CardContent className="p-0">
//       {/* === Top Section: Avatar + Info + Rating === */}
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex items-start gap-3">
//           <div className="relative shrink-0 w-12 h-12 rounded-full overflow-hidden border border-black/10 bg-neutral-100 flex items-center justify-center text-neutral-700 font-semibold text-lg uppercase">
//             {mentor?.avatar && mentor.avatar.trim() !== "" ? (
//               <img
//                 src={mentor.avatar}
//                 alt={mentor.name}
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               mentor?.name?.charAt(0) || "M"
//             )}
//             {mentor.verified && (
//               <div className="absolute -bottom-1 -right-1 bg-verified-green text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
//                 ✓
//               </div>
//             )}
//           </div>

//           <div>
//             <h3 className="font-semibold text-base text-neutral-900 leading-tight mb-0.5">
//               {mentor.name}
//             </h3>
//             <p className="text-sm text-neutral-500 mb-1">{mentor.title}</p>
//             <div className="flex items-center gap-2 text-sm text-neutral-600">
//               <Building className="w-4 h-4" />
//               <span>{mentor.company}</span>
//               <span>•</span>
//               <span>{mentor.experience} years</span>
//             </div>
//           </div>
//         </div>

//         <div className="flex items-center gap-1 text-sm font-medium text-neutral-800">
//           <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
//           <span>{mentor.rating}</span>
//           <span className="text-neutral-400 text-xs">({mentor.reviews})</span>
//         </div>
//       </div>

//       <div className="flex flex-wrap gap-2 mb-4">
//         {mentor.specialties?.map((specialty) => (
//           <Badge key={specialty} variant="secondary" className="text-xs">
//             {specialty}
//           </Badge>
//         ))}
//       </div>

//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <div
//             className={`w-2 h-2 rounded-full ${getAvailabilityColor(
//               mentor.availability
//             )}`}
//           />
//           <span className="text-sm text-neutral-500">
//             {getAvailabilityText(mentor.availability)}
//           </span>
//         </div>
//         <div className="text-right">
//           <span className="text-lg font-semibold">${mentor.price}</span>
//           <span className="text-neutral-500 text-sm">/session</span>
//         </div>
//       </div>

//     <div className="flex gap-2 mt-4">
//   <button
//     onClick={() => onViewProfile(mentor.id)}
//     className="aw-btn-secondary flex-1 text-sm"
//   >
//     View Profile
//   </button>
//   <button
//     onClick={() => onBookSession(mentor.id)}
//     className="aw-btn flex-1 text-sm bg-neutral-700 hover:bg-neutral-600 text-white shadow-[0_6px_18px_-10px_rgba(0,0,0,0.2)]"
//   >
//     Book Session
//   </button>
// </div>

//     </CardContent>
//   </Card>
// );

// };

// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Star, Building } from "lucide-react";
// import { Mentor } from "@/lib/types";

// interface MentorCardProps {
//   mentor: Mentor;
//   onViewProfile: (id: string) => void;
//   onBookSession: (id: string) => void;
//   index?: number;
// }

// export const MentorCard = ({ mentor, onViewProfile, onBookSession, index = 0 }: MentorCardProps) => {
//   const getAvailabilityColor = (availability: string) => {
//     switch (availability) {
//       case "high":
//         return "bg-verified-green";
//       case "medium":
//         return "bg-yellow-500";
//       case "low":
//         return "bg-orange-500";
//       default:
//         return "bg-gray-500";
//     }
//   };

//   const getAvailabilityText = (availability: string) => {
//     switch (availability) {
//       case "high":
//         return "Available this week";
//       case "medium":
//         return "Limited availability";
//       case "low":
//         return "Busy this week";
//       default:
//         return "Check availability";
//     }
//   };

//   // 🎨 Optional alternating soft background for variety
//   const bgColors = [
//     "bg-[#F0F7FF]", // Light Blue
//     "bg-[#F1FBF4]", // Light Green
//     "bg-[#FFF8E7]", // Light Cream
//   ];
//   const bgClass = bgColors[index % bgColors.length];

//   return (
//     <Card
//       className={`${bgClass} min-h-[380px] rounded-2xl overflow-hidden border border-neutral-200 
//                   shadow-[0_4px_20px_-6px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.2)] 
//                   transition-all duration-300 hover:-translate-y-1 flex flex-col`}
//     >
//       {/* === Top Banner Section === */}
//       <div className="bg-gradient-to-br from-[#7B61FF] to-[#4A90E2] h-20 relative">
//         <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
//           <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md bg-neutral-100 flex items-center justify-center text-neutral-600 text-xl font-semibold uppercase">
//             {mentor?.avatar && mentor.avatar.trim() !== "" ? (
//               <img
//                 src={mentor.avatar}
//                 alt={mentor.name}
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               mentor?.name?.charAt(0) || "M"
//             )}
//           </div>
//         </div>
//       </div>

//       {/* === Card Content === */}
//       <CardContent className="flex-1 flex flex-col pt-10 p-5">
//         {/* Mentor Info */}
//         <div className="text-center mb-4">
//           <h3 className="text-lg font-semibold text-neutral-900">{mentor.name}</h3>
//           <p className="text-sm text-neutral-500">{mentor.title}</p>

//           <div className="mt-2 flex justify-center items-center gap-2 text-sm text-neutral-600">
//             <Building className="w-4 h-4" />
//             <span>{mentor.company || "—"}</span>
//             <span>•</span>
//             <span>{mentor.experience} years</span>
//           </div>

//           <div className="mt-1 flex justify-center items-center gap-1 text-sm font-medium text-neutral-800">
//             <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
//             <span>{mentor.rating}</span>
//             <span className="text-neutral-400 text-xs">({mentor.reviews})</span>
//           </div>
//         </div>

//         {/* Specialties */}
//         {mentor.specialties?.length ? (
//           <div className="flex flex-wrap justify-center gap-2 mb-4">
//             {mentor.specialties.slice(0, 4).map((specialty) => (
//               <Badge
//                 key={specialty}
//                 variant="secondary"
//                 className="text-xs bg-white/70 backdrop-blur-sm border border-neutral-200"
//               >
//                 {specialty}
//               </Badge>
//             ))}
//           </div>
//         ) : (
//           <div className="mb-4" />
//         )}

//         {/* Availability & Price */}
//         <div className="flex items-center justify-between text-sm mb-4">
//           <div className="flex items-center gap-2">
//             <span className={`w-2 h-2 rounded-full ${getAvailabilityColor(mentor.availability)}`} />
//             <span className="text-neutral-600">
//               {getAvailabilityText(mentor.availability)}
//             </span>
//           </div>
//           <div className="text-right">
//             <span className="text-lg font-semibold">${mentor.price}</span>
//             <span className="text-neutral-500 text-sm">/session</span>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="mt-auto flex gap-2">
//           <button
//             onClick={() => onViewProfile(mentor.id)}
//             className="w-1/2 py-2 rounded-full border border-neutral-300 text-sm font-medium hover:bg-neutral-100 transition"
//           >
//             View Profile
//           </button>
//           <button
//             onClick={() => onBookSession(mentor.id)}
//             className="w-1/2 py-2 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-700 transition shadow-[0_6px_20px_-8px_rgba(0,0,0,0.3)]"
//           >
//             Book Session
//           </button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };


// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { Star, Building, Clock } from "lucide-react";
// import { Mentor } from "@/lib/types";

// interface MentorCardProps {
//   mentor: Mentor;
//   onViewProfile: (id: string) => void;
//   onBookSession: (id: string) => void;
//   index?: number;
// }

// export const MentorCard = ({ mentor, onViewProfile, onBookSession, index = 0 }: MentorCardProps) => {
//   const getAvailabilityColor = (availability: string) => {
//     switch (availability) {
//       case "high":
//         return "bg-green-500";
//       case "medium":
//         return "bg-yellow-500";
//       case "low":
//         return "bg-red-500";
//       default:
//         return "bg-gray-400";
//     }
//   };

//   const getAvailabilityText = (availability: string) => {
//     switch (availability) {
//       case "high":
//         return "Available this week";
//       case "medium":
//         return "Limited availability";
//       case "low":
//         return "Busy this week";
//       default:
//         return "Check availability";
//     }
//   };

//   const getInitials = (name?: string) => {
//     if (!name) return "M";
//     const parts = name.trim().split(" ");
//     if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
//     return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
//   };

//   return (
//     <Card
//       className={`relative min-h-[440px] rounded-2xl overflow-hidden bg-white text-gray-900 border border-black 
//                   shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col`}
//     >
//       {/* === Left/Right Border line changed to black === */}
//       <div className="absolute inset-y-0 left-0 w-[3px] bg-black" />

//       {/* === Avatar Section === */}
//       <div className="flex justify-center mt-6 relative">
//         <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-800 border border-gray-300">
//           {mentor.avatar && mentor.avatar.trim() !== "" ? (
//             <img
//               src={mentor.avatar}
//               alt={mentor.name}
//               className="w-full h-full object-cover rounded-full"
//             />
//           ) : (
//             getInitials(mentor.name)
//           )}
//         </div>
//         <span
//           className={`absolute bottom-2 right-[calc(50%-40px)] w-3 h-3 rounded-full border-2 border-white ${getAvailabilityColor(
//             mentor.availability
//           )}`}
//         />
//       </div>

//       {/* === Card Content === */}
//       <CardContent className="flex-1 flex flex-col pt-5 p-5">
//         {/* Mentor Info */}
//         <div className="text-center mb-4">
//           <h3 className="text-lg font-semibold">{mentor.name}</h3>
//           <p className="text-sm text-gray-500">{mentor.title}</p>

//           <div className="mt-2 flex justify-center items-center gap-2 text-sm text-gray-500">
//             <Building className="w-4 h-4" />
//             <span>{mentor.company || "—"}</span>
//             <Clock className="w-4 h-4 ml-2" />
//             <span>{mentor.experience}y exp</span>
//           </div>
//         </div>

//         {/* Rating & Price */}
//         <div className="flex justify-between items-center mb-4">
//           <div className="flex items-center gap-1 text-sm font-medium text-yellow-500">
//             <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
//             <span>{mentor.rating}</span>
//             <span className="text-gray-400 text-xs">({mentor.reviews})</span>
//           </div>
//           <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full">
//             <span className="text-black font-semibold">${mentor.price}</span>
//             <span className="text-gray-400 text-xs">/session</span>
//           </div>
//         </div>

//         {/* Availability */}
//         <div className="flex items-center justify-start gap-2 text-sm mb-4 text-gray-600">
//           <span className={`w-2 h-2 rounded-full ${getAvailabilityColor(mentor.availability)}`} />
//           <span>{getAvailabilityText(mentor.availability)}</span>
//         </div>

//         {/* Specialties */}
//         {mentor.specialties?.length ? (
//           <div className="mb-5 text-center">
//             <div className="flex flex-wrap justify-center gap-2">
//               {mentor.specialties.slice(0, 3).map((specialty) => (
//                 <Badge
//                   key={specialty}
//                   variant="secondary"
//                   className="text-xs bg-gray-100 text-gray-700 border border-gray-300 px-2 py-1 rounded-md"
//                 >
//                   {specialty}
//                 </Badge>
//               ))}
//               {mentor.specialties.length > 3 && (
//                 <Badge
//                   variant="secondary"
//                   className="text-xs bg-gray-100 text-gray-500 border border-gray-300 px-2 py-1 rounded-md"
//                 >
//                   +{mentor.specialties.length - 3}
//                 </Badge>
//               )}
//             </div>
//           </div>
//         ) : (
//           <div className="mb-4" />
//         )}

//         {/* Actions */}
//         <div className="mt-auto flex flex-col gap-3">
//           {/* Book Session - changed to black */}
//           <button
//             onClick={() => onBookSession(mentor.id)}
//             className="relative overflow-hidden w-full py-2 rounded-lg bg-black text-white text-sm font-medium transition group"
//           >
//             <span className="absolute inset-0 overflow-hidden">
//               <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine"></span>
//             </span>
//             <span className="relative inline-flex items-center justify-center gap-2">
//               Book Session
//             </span>
//           </button>

//           {/* View Profile - Outline Black */}
//           <button
//             onClick={() => onViewProfile(mentor.id)}
//             className="w-full py-2 rounded-lg border border-black text-black text-sm font-medium hover:bg-black hover:text-white transition"
//           >
//             View Profile
//           </button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { Star, Clock } from "lucide-react";
// import { Mentor } from "@/lib/types";

// interface MentorCardProps {
//   mentor: Mentor;
//   onViewProfile: (id: string) => void;
//   onBookSession: (id: string) => void;
//   index?: number;
//   isLoading?: boolean; 
// }

// export const MentorCard = ({
//   mentor,
//   onViewProfile,
//   onBookSession,
//   index = 0,
//     isLoading = false,
// }: MentorCardProps) => {
//   const getAvailabilityColor = (availability: string) => {
//     switch (availability) {
//       case "high":
//         return "bg-green-500";
//       case "medium":
//         return "bg-yellow-500";
//       case "low":
//         return "bg-red-500";
//       default:
//         return "bg-gray-400";
//     }
//   };

//   const getAvailabilityText = (availability: string) => {
//     switch (availability) {
//       case "high":
//         return "Available this week";
//       case "medium":
//         return "Limited availability";
//       case "low":
//         return "Busy this week";
//       default:
//         return "Check availability";
//     }
//   };

//   const getInitials = (name?: string) => {
//     if (!name) return "M";
//     const parts = name.trim().split(" ");
//     if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
//     return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
//   };

//   return (
//     <Card
//       className="relative flex flex-col rounded-2xl border border-gray-100 bg-white 
//       shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] 
//       transition-all duration-300 overflow-hidden p-5"
//     >
//       {/* === Top Section: Avatar, Rating, Availability === */}
//       <div className="flex items-start justify-between mb-4">
//         {/* Avatar */}
//         <div className="w-14 h-14 rounded-full bg-[#0F1F3D] text-white flex items-center justify-center text-lg font-semibold shadow-sm">
//           {mentor.avatar && mentor.avatar.trim() !== "" ? (
//             <img
//               src={mentor.avatar}
//               alt={mentor.name}
//               className="w-full h-full object-cover rounded-full"
//             />
//           ) : (
//             getInitials(mentor.name)
//           )}
//         </div>

//         <div className="flex flex-col items-end space-y-2">
//           {/* Rating */}
//           <div className="flex items-center text-sm text-yellow-500 font-medium">
//             <Star className="w-4 h-4 fill-yellow-500 mr-1" />
//             <span>{mentor.rating.toFixed(1)}</span>
//             <span className="text-gray-400 ml-1">({mentor.reviews})</span>
//           </div>

//           {/* Availability Badge */}
//      {/* ✅ Fixed Availability Badge */}
// {mentor.availability ? (
//   <div
//     className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium text-white ${
//       mentor.availability === "high"
//         ? "bg-green-600"
//         : mentor.availability === "medium"
//         ? "bg-yellow-500"
//         : "bg-gray-400"
//     }`}
//   >
//     <span className="w-2 h-2 rounded-full bg-white"></span>
//     {getAvailabilityText(mentor.availability)}
//   </div>
// ) : (
//   <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium bg-gray-200 text-gray-600">
//     Not Available
//   </div>
// )}

//         </div>
//       </div>

//       {/* === Middle Section: Name & Title === */}
//      {/* === Middle Section: Name, Title & Company === */}
// <div className="text-left mb-4">
//   <h3 className="text-base font-semibold text-gray-900">
//     {mentor.name}
//   </h3>

//   <p className="text-sm text-gray-500">
//     {mentor.title}
//   </p>

//   {mentor.company && (
//     <p className="text-sm text-gray-600 font-medium">
//       {mentor.company}
//     </p>
//   )}
// </div>


//       <hr className="border-gray-200 mb-4" />

//       {/* === Price & Experience === */}
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <div className="text-xl font-bold text-gray-900">
//             ${mentor.price}
//             <span className="text-gray-500 text-sm font-normal ml-1">
//               / session
//             </span>
//           </div>
//         </div>
//         <div className="flex items-center gap-1 text-sm text-gray-600">
//           <Clock className="w-4 h-4 text-gray-400" />
//           <span>{mentor.experience} Years Experience</span>
//         </div>
//       </div>

//       {/* === Specialties === */}
//       {mentor.specialties?.length ? (
//         <div className="mb-5 flex flex-wrap gap-2">
//           {mentor.specialties.slice(0, 3).map((specialty) => (
//             <span
//               key={specialty}
//               className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-100"
//             >
//               {specialty}
//             </span>
//           ))}
//           {mentor.specialties.length > 3 && (
//             <span className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
//               +{mentor.specialties.length - 3}
//             </span>
//           )}
//         </div>
//       ) : (
//         <div className="mb-5" />
//       )}

//       {/* === Buttons === */}
//       <div className="flex gap-2 mt-auto">
//       <button
//   onClick={() => onBookSession(mentor.id)}
//   className="flex-1 py-2 rounded-full bg-[#0F1F3D] text-white text-sm font-medium hover:bg-[#0C162E] transition"
// >
//   Book Session
// </button>

// <button
//   onClick={() => onViewProfile(mentor.id)}
//   disabled={isLoading} // ✅ disable while loading
//   className={`flex-1 py-2 rounded-full border border-gray-300 text-gray-800 text-sm font-medium transition ${
//     isLoading ? "cursor-not-allowed bg-gray-100" : "hover:bg-gray-50"
//   }`}
// >
//   {isLoading ? (
//     <div className="flex justify-center items-center gap-2">
//       <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
//       Loading...
//     </div>
//   ) : (
//     "View Profile"
//   )}
// </button>

//       </div>
//     </Card>
//   );
// };


// import { Card } from "@/components/ui/card";
// import { Star, Clock } from "lucide-react";
// import { Mentor } from "@/lib/types";

// interface MentorCardProps {
//   mentor: Mentor;
//   onViewProfile: (id: string) => void;
//   onBookSession: (id: string) => void;
//   index?: number;
//   isLoading?: boolean;
// }

// export const MentorCard = ({
//   mentor,
//   onViewProfile,
//   onBookSession,
//   isLoading = false,
// }: MentorCardProps) => {
//   const getInitials = (name?: string) => {
//     if (!name) return "M";
//     const parts = name.trim().split(" ");
//     if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
//     return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
//   };

//   const availabilityPill =
//     mentor.availability === "high"
//       ? "bg-green-600 text-white"
//       : mentor.availability === "medium"
//       ? "bg-yellow-500 text-white"
//       : mentor.availability === "low"
//       ? "bg-red-500 text-white"
//       : "bg-gray-200 text-gray-700";

//   const availabilityText =
//     mentor.availability === "high"
//       ? "Available this week"
//       : mentor.availability === "medium"
//       ? "Limited availability"
//       : mentor.availability === "low"
//       ? "Busy this week"
//       : "Check availability";

//   // Dummy fallback image if avatar is empty
//   const avatarUrl =
//     mentor.avatar && mentor.avatar.trim() !== ""
//       ? mentor.avatar
//       : `https://randomuser.me/api/portraits/${
//           Math.random() > 0.5 ? "men" : "women"
//         }/${Math.floor(Math.random() * 50)}.jpg`;

//   return (
//     <Card className="w-full flex flex-col md:flex-row justify-between border border-gray-200 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
//       {/* LEFT: Avatar + Details */}
//       <div className="flex flex-col md:flex-row gap-4 p-4 flex-1">
//         {/* Avatar */}
//         <div className="w-20 h-20 rounded-lg bg-[#0F1F3D] text-white flex items-center justify-center text-xl font-semibold overflow-hidden flex-shrink-0">
//           {avatarUrl ? (
//             <img
//               src={avatarUrl}
//               alt={mentor.name}
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             getInitials(mentor.name)
//           )}
//         </div>

//         {/* Name, Title, Company */}
//         <div className="flex flex-col justify-between flex-1">
//           <div>
//             <div className="flex items-center flex-wrap gap-2">
//               <h2 className="text-base md:text-lg font-semibold text-gray-900">
//                 {mentor.name}
//               </h2>
//               <div className="flex items-center text-sm text-yellow-500 font-medium">
//                 <Star className="w-4 h-4 fill-yellow-500 mr-1" />
//                 <span>{mentor.rating.toFixed(1)}</span>
//                 <span className="text-gray-400 ml-1">({mentor.reviews})</span>
//               </div>
//             </div>

//             {mentor.title && (
//               <p className="text-sm font-medium text-gray-800 mt-1">
//                 {mentor.title}
//                 {mentor.company && ` @ ${mentor.company}`}
//               </p>
//             )}

//             {/* Availability */}
//             <div
//               className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium mt-2 w-fit ${availabilityPill}`}
//             >
//               {availabilityText}
//             </div>

//             {/* Specialties */}
//             {mentor.specialties?.length ? (
//               <div className="mt-3 flex flex-wrap gap-2">
//                 {mentor.specialties.slice(0, 4).map((s) => (
//                   <span
//                     key={s}
//                     className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-100"
//                   >
//                     {s}
//                   </span>
//                 ))}
//                 {mentor.specialties.length > 4 && (
//                   <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
//                     +{mentor.specialties.length - 4}
//                   </span>
//                 )}
//               </div>
//             ) : null}
//           </div>
//         </div>
//       </div>

//       {/* RIGHT: Price & Actions */}
//       <div className="w-full md:w-56 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col justify-between p-4">
//         <div className="text-right mb-3">
//           <p className="text-xl font-bold text-gray-900">
//             ₹{mentor.price}
//             <span className="text-sm font-normal">/Month</span>
//           </p>
//         </div>

//         <div className="flex flex-col gap-2">
//           <button
//             onClick={() => onViewProfile(mentor.id)}
//             disabled={isLoading}
//             className={`w-full py-2 rounded-md border border-gray-300 text-gray-800 text-sm font-medium transition ${
//               isLoading ? "cursor-not-allowed bg-gray-100" : "hover:bg-gray-50"
//             }`}
//           >
//             {isLoading ? (
//               <span className="inline-flex items-center gap-2">
//                 <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
//                 Loading...
//               </span>
//             ) : (
//               "View Profile"
//             )}
//           </button>

//           <button
//             onClick={() => onBookSession(mentor.id)}
//             className="w-full py-2 rounded-md bg-[#0F1F3D] text-white text-sm font-medium hover:bg-[#0C162E] transition"
//           >
//             Book Session
//           </button>
//         </div>
//       </div>
//     </Card>
//   );
// };

// import { Card } from "@/components/ui/card";
// import { Star, Clock } from "lucide-react";
// import { Mentor } from "@/lib/types";

// interface MentorCardProps {
//   mentor: Mentor;
//   onViewProfile: (id: string) => void;
//   onBookSession: (id: string) => void;
//   index?: number;
//   isLoading?: boolean;
// }

// export const MentorCard = ({
//   mentor,
//   onViewProfile,
//   onBookSession,
//   isLoading = false,
// }: MentorCardProps) => {
//   const getInitials = (name?: string) => {
//     if (!name) return "M";
//     const parts = name.trim().split(" ");
//     if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
//     return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
//   };

//   const availabilityPill =
//     mentor.availability === "high"
//       ? "bg-green-600 text-white"
//       : mentor.availability === "medium"
//       ? "bg-yellow-500 text-white"
//       : mentor.availability === "low"
//       ? "bg-red-500 text-white"
//       : "bg-gray-200 text-gray-700";

//   const availabilityText =
//     mentor.availability === "high"
//       ? "Available this week"
//       : mentor.availability === "medium"
//       ? "Limited availability"
//       : mentor.availability === "low"
//       ? "Busy this week"
//       : "Check availability";

//   // Dummy fallback image if avatar is empty
//   const avatarUrl =
//     mentor.avatar && mentor.avatar.trim() !== ""
//       ? mentor.avatar
//       : `https://randomuser.me/api/portraits/${
//           Math.random() > 0.5 ? "men" : "women"
//         }/${Math.floor(Math.random() * 50)}.jpg`;
// return (
//   <Card className="w-full flex flex-col md:flex-row justify-between border border-gray-200 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
//     {/* LEFT: Avatar + Details */}
//     <div className="flex flex-col md:flex-row gap-4 p-4 flex-1">
//       {/* Avatar */}
//       <div className="w-28 h-28 md:w-32 md:h-32 rounded-lg bg-[#0F1F3D] text-white flex items-center justify-center text-2xl font-semibold overflow-hidden flex-shrink-0">
//         {avatarUrl ? (
//           <img
//             src={avatarUrl}
//             alt={mentor.name}
//             className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
//             loading="lazy"
//           />
//         ) : (
//           getInitials(mentor.name)
//         )}
//       </div>

//       {/* Name, Title, Company */}
//       <div className="flex flex-col justify-between flex-1">
//         <div>
//           <div className="flex items-center flex-wrap gap-2">
//             <h2 className="text-base md:text-lg font-semibold text-gray-900">
//               {mentor.name}
//             </h2>

//             {/* ✅ Updated Rating Block */}
//             {mentor.rating > 0 ? (
//               <div className="flex items-center text-sm text-yellow-500 font-medium">
//                 <Star className="w-4 h-4 fill-yellow-500 mr-1" />
//                 <span>{mentor.rating.toFixed(1)}</span>
//                 <span className="text-gray-400 ml-1">
//                   ({mentor.reviews} review{mentor.reviews !== 1 ? "s" : ""})
//                 </span>
//               </div>
//             ) : (
//               <div className="text-xs text-gray-400 italic">
//                 No reviews yet
//               </div>
//             )}
//           </div>

//           {mentor.title && (
//             <p className="text-sm font-medium text-gray-800 mt-1">
//               {mentor.title}
//               {mentor.company && ` @ ${mentor.company}`}
//             </p>
//           )}

//           {/* Availability */}
//           <div
//             className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium mt-2 w-fit ${availabilityPill}`}
//           >
//             {availabilityText}
//           </div>

//           {/* Specialties */}
//           {mentor.specialties?.length ? (
//             <div className="mt-3 flex flex-wrap gap-2">
//               {mentor.specialties.slice(0, 4).map((s) => (
//                 <span
//                   key={s}
//                   className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-100"
//                 >
//                   {s}
//                 </span>
//               ))}
//               {mentor.specialties.length > 4 && (
//                 <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
//                   +{mentor.specialties.length - 4}
//                 </span>
//               )}
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </div>

//     {/* RIGHT: Experience, Price & Actions */}
//     <div className="w-full md:w-56 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col justify-between p-4">
//       {/* Experience */}
//       {mentor.experience !== undefined && (
//         <div className="flex items-center justify-end text-sm text-gray-600 mb-2">
//           <Clock className="w-4 h-4 text-gray-400 mr-1" />
//           <span>{mentor.experience} Years Experience</span>
//         </div>
//       )}

//       {/* Price */}
//       <div className="text-right mb-3">
//         <p className="text-xl font-bold text-gray-900">
//           ₹{mentor.price}
//           <span className="text-sm font-normal">/Month</span>
//         </p>
//       </div>

//       {/* Buttons */}
//       <div className="flex flex-col gap-2">
//         <button
//           onClick={() => onViewProfile(mentor.id)}
//           disabled={isLoading}
//           className={`w-full py-2 rounded-md border border-gray-300 text-gray-800 text-sm font-medium transition ${
//             isLoading ? "cursor-not-allowed bg-gray-100" : "hover:bg-gray-50"
//           }`}
//         >
//           {isLoading ? (
//             <span className="inline-flex items-center gap-2">
//               <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
//               Loading...
//             </span>
//           ) : (
//             "View Profile"
//           )}
//         </button>

//         <button
//           onClick={() => onBookSession(mentor.id)}
//           className="w-full py-2 rounded-md bg-[#0F1F3D] text-white text-sm font-medium hover:bg-[#0C162E] transition"
//         >
//           Book Session
//         </button>
//       </div>
//     </div>
//   </Card>
// );

// };

import { Card } from "@/components/ui/card";
import { Star, Clock } from "lucide-react";
import { Mentor } from "@/lib/types";

interface MentorCardProps {
  mentor: Mentor;
  onViewProfile: (id: string) => void;
  onBookSession: (id: string) => void;
  index?: number;
  isLoading?: boolean;
}

export const MentorCard = ({
  mentor,
  onViewProfile,
  onBookSession,
  isLoading = false,
}: MentorCardProps) => {
  const getInitials = (name?: string) => {
    if (!name) return "M";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  };

  const availabilityPill =
    mentor.availability === "high"
      ? "bg-green-600 text-white"
      : mentor.availability === "medium"
      ? "bg-yellow-500 text-white"
      : mentor.availability === "low"
      ? "bg-red-500 text-white"
      : "bg-gray-200 text-gray-700";

  const availabilityText =
    mentor.availability === "high"
      ? "Available this week"
      : mentor.availability === "medium"
      ? "Limited availability"
      : mentor.availability === "low"
      ? "Busy this week"
      : "Check availability";

  // Dummy fallback image if avatar is empty
  const avatarUrl =
    mentor.avatar && mentor.avatar.trim() !== ""
      ? mentor.avatar
      : `https://randomuser.me/api/portraits/${
          Math.random() > 0.5 ? "men" : "women"
        }/${Math.floor(Math.random() * 50)}.jpg`;

  // Get the session amount (original session amount in INR)
  // 🟡 Ensure we always have a number
const originalSessionAmount = Number(mentor.session_amount ?? 0);
const clientSessionAmount = originalSessionAmount * 1.30;


  return (
    <Card className="w-full flex flex-col md:flex-row justify-between border border-gray-200 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* LEFT: Avatar + Details */}
      <div className="flex flex-col md:flex-row gap-4 p-4 flex-1">
        {/* Avatar */}
        <div className="w-28 h-28 md:w-32 md:h-32 rounded-lg bg-[#0F1F3D] text-white flex items-center justify-center text-2xl font-semibold overflow-hidden flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={mentor.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          ) : (
            getInitials(mentor.name)
          )}
        </div>

        {/* Name, Title, Company */}
        <div className="flex flex-col justify-between flex-1">
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                {mentor.name}
              </h2>

              {/* ✅ Updated Rating Block */}
              {mentor.rating > 0 ? (
                <div className="flex items-center text-sm text-yellow-500 font-medium">
                  <Star className="w-4 h-4 fill-yellow-500 mr-1" />
                  <span>{mentor.rating.toFixed(1)}</span>
                  <span className="text-gray-400 ml-1">
                    ({mentor.reviews} review{mentor.reviews !== 1 ? "s" : ""})
                  </span>
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">
                  No reviews yet
                </div>
              )}
            </div>

            {mentor.title && (
              <p className="text-sm font-medium text-gray-800 mt-1">
                {mentor.title}
                {mentor.company && ` @ ${mentor.company}`}
              </p>
            )}

            {/* Availability */}
            <div
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium mt-2 w-fit ${availabilityPill}`}
            >
              {availabilityText}
            </div>

            {/* Specialties */}
            {mentor.specialties?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {mentor.specialties.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-100"
                  >
                    {s}
                  </span>
                ))}
                {mentor.specialties.length > 4 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
                    +{mentor.specialties.length - 4}
                  </span>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* RIGHT: Experience, Price & Actions */}
      <div className="w-full md:w-56 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col justify-between p-4">
        {/* Experience */}
        {mentor.experience !== undefined && (
          <div className="flex items-center justify-end text-sm text-gray-600 mb-2">
            <Clock className="w-4 h-4 text-gray-400 mr-1" />
            <span>{mentor.experience} Years Experience</span>
          </div>
        )}

        {/* Price */}
        <div className="text-right mb-3">
          <p className="text-xl font-bold text-gray-900">
            {/* Show 30% extra for client view */}
            ₹{clientSessionAmount.toFixed(2)}
            <span className="text-sm font-normal">/session</span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onViewProfile(mentor.id)}
            disabled={isLoading}
            className={`w-full py-2 rounded-md border border-gray-300 text-gray-800 text-sm font-medium transition ${
              isLoading ? "cursor-not-allowed bg-gray-100" : "hover:bg-gray-50"
            }`}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Loading...
              </span>
            ) : (
              "View Profile"
            )}
          </button>

          <button
            onClick={() => onBookSession(mentor.id)}
            className="w-full py-2 rounded-md bg-[#0F1F3D] text-white text-sm font-medium hover:bg-[#0C162E] transition"
          >
            Book Session
          </button>
        </div>
      </div>
    </Card>
  );
};
