import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Entity as EntityType, Review } from "@/types";
import { getEntity } from "@/features/entities/entityService";
import { listReviewsForEntity } from "@/features/reviews/reviewService";
import ReviewForm from "@/features/reviews/ReviewForm";
import ReviewList from "@/features/reviews/ReviewList";

export default function Entity() {
  const { entityId } = useParams();
  const [entity, setEntity] = useState<EntityType | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!entityId) return;
    const data = await listReviewsForEntity(entityId);
    setReviews(data);
  }

  useEffect(() => {
    (async () => {
      if (!entityId) return;
      setLoading(true);
      try {
        const e = await getEntity(entityId);
        setEntity(e);
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
  }, [entityId]);

  if (loading) return <div>Loading...</div>;
  if (!entity) return <div>Entity not found.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{entity.name}</h1>
        <div className="text-zinc-600">{entity.subtitle ?? entity.type}</div>
      </div>

      <ReviewForm entityId={entity.id} onCreated={refresh} />
      <ReviewList reviews={reviews} />
    </div>
  );
}
