import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { listReviewsForUser } from "@/features/reviews/reviewService";
import { Review } from "@/types";
import ReviewList from "@/features/reviews/ReviewList";

export default function MyReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoading(true);
      try {
        const data = await listReviewsForUser(user.uid);
        setReviews(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">My Reviews</div>
      <ReviewList reviews={reviews} />
    </div>
  );
}
