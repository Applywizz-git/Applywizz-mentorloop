import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  bookingId: string;
}

export default function MentorFeedbackView({ bookingId }: Props) {
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("mentor_reviews")
        .select("rating, comment, created_at")
        .eq("booking_id", bookingId)
        .single();

      if (!error && data) setReview(data);
      setLoading(false);
    })();
  }, [bookingId]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (!review) return <p className="text-sm text-muted-foreground">No feedback yet for this session.</p>;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`text-lg ${n <= review.rating ? "text-yellow-400" : "text-gray-300"}`}
          >
            ★
          </span>
        ))}
      </div>
      {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
      <p className="text-xs text-muted-foreground">
        {new Date(review.created_at).toLocaleString()}
      </p>
    </div>
  );
}
