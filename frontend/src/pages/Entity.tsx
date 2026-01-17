import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Entity as EntityData, Review, ImportedProfReview } from "@/types";
import { getEntity, toggleBookmark, isBookmarked } from "@/features/entities/entityService";
import { listReviewsForEntity, listImportedProfReviews } from "@/features/reviews/reviewService";
import { getApplicableSubratings } from "@/config/subratings";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ReviewList from "@/features/reviews/ReviewList";
import ImportedReviewList from "@/features/reviews/ImportedReviewList";

// Subratings breakdown component (horizontal bars)
function SubratingsBreakdown({ reviews, entity }: { reviews: Review[]; entity: EntityData }) {
  const applicableSubratings = getApplicableSubratings(entity.type, entity);
  
  // Calculate averages for each subrating
  const subratingStats = applicableSubratings.map((subrating) => {
    const ratings = reviews
      .map((r) => r.subratings?.[subrating.key])
      .filter((v): v is number => v !== null && v !== undefined && v > 0);
    
    const avg = ratings.length > 0
      ? ratings.reduce((sum, v) => sum + v, 0) / ratings.length
      : null;
    
    return {
      key: subrating.key,
      label: subrating.label,
      avg,
      count: ratings.length,
    };
  });

  return (
    <Card className="space-y-3 flex-1">
      <h2 className="font-semibold">Subratings</h2>
      <div className="space-y-2">
        {subratingStats.map((stat) => {
          const pct = stat.avg !== null ? (stat.avg / 5) * 100 : 0;
          return (
            <div key={stat.key} className="flex items-center gap-2 text-sm">
              <span className="w-32 truncate text-zinc-600" title={stat.label}>{stat.label}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full bg-yellow-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {stat.avg !== null ? (
                <>
                  <span className="w-8 text-right font-medium">{stat.avg.toFixed(1)}</span>
                  <span className="text-yellow-500">★</span>
                  <span className="w-6 text-right text-xs text-zinc-400">{stat.count}</span>
                </>
              ) : (
                <span className="w-20 text-right text-xs text-zinc-400">No data</span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Rating breakdown component (5 to 1 stars)
function RatingBreakdown({ reviews }: { reviews: Review[] }) {
  const counts = [0, 0, 0, 0, 0]; // 1-5 stars
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++;
  });
  const total = reviews.length || 1;

  return (
    <Card className="space-y-3">
      <h2 className="font-semibold">Rating Breakdown</h2>
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = counts[stars - 1];
          const pct = (count / total) * 100;
          return (
            <div key={stars} className="flex items-center gap-2 text-sm">
              <span className="w-3">{stars}</span>
              <span className="text-yellow-500">★</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full bg-yellow-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs text-zinc-400">{count}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Reviews Summary component
function ReviewsSummary({ reviews, entity }: { reviews: Review[]; entity: EntityData }) {
  // Get most common tags
  const tagCounts: Record<string, number> = {};
  reviews.forEach((r) => {
    r.tags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  if (reviews.length === 0) return null;

  return (
    <Card className="space-y-3">
      <h2 className="flex items-center gap-2 font-semibold">
        <span>✨</span> Reviews Summary
      </h2>
      <p className="text-zinc-600 leading-relaxed">
        Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}, {entity.name} has an 
        average rating of {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} stars.
        {reviews.length >= 3 && " Students have shared their experiences to help you make an informed decision."}
      </p>
      {topTags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {topTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function Entity() {
  const { entityId } = useParams();
  
  const [entity, setEntity] = useState<EntityData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [importedReviews, setImportedReviews] = useState<ImportedProfReview[]>([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!entityId) return;
    const data = await listReviewsForEntity(entityId);
    setReviews(data);
  }

  async function loadImportedReviews() {
    if (!entityId || entity?.type !== "PROFESSOR") return;
    const data = await listImportedProfReviews(entityId);
    setImportedReviews(data);
  }

  useEffect(() => {
    (async () => {
      if (!entityId) return;
      setLoading(true);
      try {
        const e = await getEntity(entityId);
        setEntity(e);
        await refresh();
        
        // Load bookmark status
        const isBookmarkedStatus = await isBookmarked(entityId);
        setBookmarked(isBookmarkedStatus);
        
        // Load imported reviews for professors
        if (e?.type === "PROFESSOR") {
          const imported = await listImportedProfReviews(entityId);
          setImportedReviews(imported);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [entityId]);

  async function handleToggleBookmark() {
    if (!entityId) return;
    const newStatus = await toggleBookmark(entityId);
    setBookmarked(newStatus);
  }

  if (loading) return <div className="py-8 text-center text-zinc-500">Loading...</div>;
  if (!entity) return (
    <div className="py-12 text-center">
      <h1 className="text-2xl font-bold">Entity not found</h1>
      <Link to="/" className="mt-4 text-blue-600 hover:underline">Go back home</Link>
    </div>
  );

  // Always calculate average from actual reviews (more accurate than entity.avgRating which may not update)
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : (entity.avgRating ?? 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{entity.name}</h1>
            <Button
              variant="ghost"
              onClick={handleToggleBookmark}
              title={bookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              {bookmarked ? "🔖" : "📑"}
            </Button>
          </div>
          <div className="text-lg text-zinc-600">{entity.subtitle}</div>
          
          {/* Tags */}
          {entity.tags && entity.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {entity.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Write a Review Button */}
        <Link to={`/write/${entity.id}`}>
          <Button className="px-6 py-3 text-base cursor-pointer">Write a Review</Button>
        </Link>
      </div>

      {/* Rating Breakdown & Subratings Side by Side */}
      <div className="grid gap-6 md:grid-cols-2">
        <RatingBreakdown reviews={reviews} />
        <SubratingsBreakdown reviews={reviews} entity={entity} />
      </div>

      {/* Reviews Summary */}
      <ReviewsSummary reviews={reviews} entity={entity} />

      {/* AI-Extracted Reviews (Professors only) */}
      {entity.type === "PROFESSOR" && importedReviews.length > 0 && (
        <ImportedReviewList reviews={importedReviews} onUpdate={loadImportedReviews} />
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Reviews ({reviews.length})</h2>
        <ReviewList reviews={reviews} entityType={entity.type} />
      </div>
    </div>
  );
}
