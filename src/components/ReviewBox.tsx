// // src/components/ReviewBox.tsx
// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";

// type Props = {
//   bookingId: string;
//   mentorId: string;
//   onSubmitted?: () => void;
// };

// export default function ReviewBox({ bookingId, mentorId, onSubmitted }: Props) {
//   const [rating, setRating] = useState<number>(0);
//   const [comment, setComment] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [done, setDone] = useState(false);

//   // Hide the form if a review already exists for this booking
//   useEffect(() => {
//     let ignore = false;
//     (async () => {
//       const { data, error } = await supabase
//         .from("mentor_reviews")
//         .select("id")
//         .eq("booking_id", bookingId)
//         .limit(1);
//       if (!ignore && !error && data && data.length > 0) setDone(true);
//     })();
//     return () => { ignore = true; };
//   }, [bookingId]);

//   async function submit() {
//     setSubmitting(true);
//     setError(null);

//     const { data: u } = await supabase.auth.getUser();
//     const uid = u?.user?.id;
//     if (!uid) {
//       setSubmitting(false);
//       setError("Please login to submit a review.");
//       return;
//     }
//     if (rating < 1 || rating > 5) {
//       setSubmitting(false);
//       setError("Please select a rating (1–5).");
//       return;
//     }
//     if (!comment.trim()) {
//       setSubmitting(false);
//       setError("Please write a short review.");
//       return;
//     }

//     const { error: insertErr } = await supabase.from("mentor_reviews").insert({
//       booking_id: bookingId,
//       mentor_id: mentorId,
//       reviewer_id: uid,
//       rating,
//       comment: comment.trim(),
//     });

//     if (insertErr) {
//       setSubmitting(false);
//       setError(insertErr.message);
//       return;
//     }

//     setDone(true);
//     setSubmitting(false);
//     onSubmitted?.();
//   }

//   if (done) {
//     return (
//       <Card className="border">
//         <CardContent className="p-4">
//           <p className="text-sm">Thanks! Your review was submitted.</p>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="border">
//       <CardContent className="p-4 space-y-3">
//         <div>
//           <Label className="block mb-2">Rate your session</Label>
//           <div className="flex gap-2">
//             {[1,2,3,4,5].map(n => (
//               <button
//                 key={n}
//                 type="button"
//                 onClick={() => setRating(n)}
//                 className={`h-9 w-9 rounded-full border flex items-center justify-center text-sm ${
//                   rating >= n ? "bg-foreground text-background" : "bg-background"
//                 }`}
//                 aria-label={`${n} star${n>1?"s":""}`}
//               >
//                 {n}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div>
//           <Label htmlFor="comment">Your review</Label>
//           <Textarea
//             id="comment"
//             rows={4}
//             value={comment}
//             onChange={e => setComment(e.target.value)}
//             placeholder="What went well? Anything to improve?"
//           />
//         </div>

//         {error && <p className="text-sm text-red-600">{error}</p>}
//         <div className="flex justify-end">
//           <Button onClick={submit} disabled={submitting}>
//             {submitting ? "Submitting..." : "Submit Review"}
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }


import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  bookingId: string;
  mentorId: string;
  onSubmitted?: () => void;
};

interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ReviewBox({ bookingId, mentorId, onSubmitted }: Props) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingReview, setExistingReview] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);

  // 📝 Check if a review already exists for this booking
  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data, error } = await supabase
        .from("mentor_reviews")
        .select("id, rating, comment, created_at")
        .eq("booking_id", bookingId)
        .eq("given_by", "client")
        .maybeSingle();

      if (!ignore && !error && data) {
        setExistingReview(data as ReviewData);
      }
      setLoading(false);
    })();
    return () => {
      ignore = true;
    };
  }, [bookingId]);

  async function submit() {
    setSubmitting(true);
    setError(null);

    const { data: u } = await supabase.auth.getUser();
    const uid = u?.user?.id;
    if (!uid) {
      setSubmitting(false);
      setError("Please login to submit a review.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setSubmitting(false);
      setError("Please select a rating (1–5).");
      return;
    }

    if (!comment.trim()) {
      setSubmitting(false);
      setError("Please write a short review.");
      return;
    }

    const { error: insertErr } = await supabase.from("mentor_reviews").insert({
      booking_id: bookingId,
      mentor_id: mentorId,
      reviewer_id: uid,
      given_by: "client",
      rating,
      comment: comment.trim(),
      created_at: new Date().toISOString(),
    });
    // ✅ Recalculate mentor's average rating after successful review
const { data: avgData, error: avgError } = await supabase
  .from("mentor_reviews")
  .select("rating")
  .eq("mentor_id", mentorId);

if (!avgError && avgData) {
  const ratings = avgData.map((r) => r.rating);
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;

  await supabase
    .from("mentors")
    .update({ rating: avg.toFixed(1), reviews: ratings.length })
    .eq("id", mentorId);
}

    if (insertErr) {
      setSubmitting(false);
      setError(insertErr.message);
      return;
    }

    setExistingReview({
      id: bookingId,
      rating,
      comment: comment.trim(),
      created_at: new Date().toISOString(),
    });
    setSubmitting(false);
    onSubmitted?.();
  }

  if (loading) {
    return (
      <Card className="border">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Loading review…</p>
        </CardContent>
      </Card>
    );
  }

  // ✅ Show existing review if one is found
  if (existingReview) {
    return (
      <Card className="border">
        <CardContent className="p-4 space-y-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={`text-lg ${
                  n <= existingReview.rating ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
          {existingReview.comment && (
            <p className="text-sm text-muted-foreground">{existingReview.comment}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Submitted on {new Date(existingReview.created_at).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    );
  }

  // ✍ Review form (shown only if no existing review)
  return (
    <Card className="border">
      <CardContent className="p-4 space-y-3">
        <div>
          <Label className="block mb-2">Rate your session</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`h-9 w-9 rounded-full border flex items-center justify-center text-sm ${
                  rating >= n ? "bg-foreground text-background" : "bg-background"
                }`}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="comment">Your review</Label>
          <Textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What went well? Anything to improve?"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end">
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
