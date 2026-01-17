import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Entity as EntityData, Review, ImportedProfReview } from "@/types";
import { getEntity, toggleBookmark, isBookmarked } from "@/features/entities/entityService";
import { listReviewsForEntity, listImportedProfReviews } from "@/features/reviews/reviewService";
import { getApplicableSubratings } from "@/config/subratings";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ReviewForm from "@/features/reviews/ReviewForm";
import ReviewList from "@/features/reviews/ReviewList";
import ImportedReviewList from "@/features/reviews/ImportedReviewList";
import { useAuth } from "@/providers/AuthProvider";

// Subratings breakdown component
function SubratingsBreakdown({ reviews, entity }: { reviews: Review[]; entity: EntityData }) {
  const applicableSubratings = getApplicableSubratings(entity.type, entity);
  
  // Calculate averages for each subrating
  const subratingStats = applicableSubratings.map((subrating) => {
    const ratings = reviews
      .map((r) => r.subratings?.[subrating.key])
      .filter((v): v is number => v !== null && v !== undefined);
    
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

  // Only show if at least one subrating has data
  const hasAnyData = subratingStats.some((s) => s.count > 0);
  if (!hasAnyData) return null;

  return (
    <Card className="space-y-3">
      <h2 className="font-semibold">Subratings</h2>
      <div className="space-y-1">
        {subratingStats.map((stat) => {
          const pct = stat.avg !== null ? (stat.avg / 5) * 100 : 0;
          return (
            <div key={stat.key} className="flex items-center gap-2 text-sm">
              <span className="w-28 truncate text-zinc-600" title={stat.label}>{stat.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full bg-yellow-400"
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

// Rating breakdown component
function RatingBreakdown({ reviews }: { reviews: Review[] }) {
  const counts = [0, 0, 0, 0, 0]; // 1-5 stars
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++;
  });
  const total = reviews.length || 1;

  return (
    <div className="space-y-1">
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = counts[stars - 1];
        const pct = (count / total) * 100;
        return (
          <div key={stars} className="flex items-center gap-2 text-sm">
            <span className="w-3">{stars}</span>
            <span className="text-yellow-500">★</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full bg-yellow-400"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs text-zinc-400">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Entity() {
  const { entityId } = useParams();
  useAuth(); // Ensure auth context is available
  
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

  const avgRating = entity.avgRating ?? (reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0);

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

        {/* Rating Summary */}
        <Card className="min-w-[200px] text-center">
          <div className="text-4xl font-bold text-yellow-600">
            {avgRating > 0 ? avgRating.toFixed(1) : "—"}
          </div>
          <div className="text-yellow-500">
            {"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}
          </div>
          <div className="mt-1 text-sm text-zinc-500">
            {entity.ratingCount ?? reviews.length} reviews
          </div>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Rating Breakdown */}
        <Card className="space-y-3">
          <h2 className="font-semibold">Rating Breakdown</h2>
          <RatingBreakdown reviews={reviews} />
        </Card>

        {/* Location / Info */}
        <Card className="space-y-3">
          <h2 className="font-semibold">Details</h2>
          <div className="space-y-2 text-sm">
            {entity.zone && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Zone</span>
                <span>{entity.zone.replace("_", " ")}</span>
              </div>
            )}
            {entity.type === "TOILET" && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Shower</span>
                <span>{entity.hasShower ? "Yes 🚿" : "No"}</span>
              </div>
            )}
            {entity.location && (
              <div className="pt-2">
                <a
                  href={`https://www.google.com/maps?q=${entity.location.lat},${entity.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  📍 View on Google Maps
                </a>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Subratings Breakdown */}
      <SubratingsBreakdown reviews={reviews} entity={entity} />

      {/* Image Placeholder */}
      <Card className="flex h-40 items-center justify-center bg-zinc-50 text-zinc-400">
        📷 Images coming soon
      </Card>

      {/* AI-Extracted Reviews (Professors only) */}
      {entity.type === "PROFESSOR" && importedReviews.length > 0 && (
        <ImportedReviewList reviews={importedReviews} onUpdate={loadImportedReviews} />
      )}

      {/* Write Review Link */}
      <div className="flex items-center justify-between rounded-xl border bg-zinc-50 p-4">
        <div>
          <div className="font-semibold">Have something to say?</div>
          <div className="text-sm text-zinc-500">Share your experience with others</div>
        </div>
        <Link to={`/write/${entity.id}`}>
          <Button>Write a Review</Button>
        </Link>
      </div>

      {/* Inline Review Form */}
      <ReviewForm entity={entity} onCreated={refresh} />

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Reviews ({reviews.length})</h2>
        <ReviewList reviews={reviews} entityType={entity.type} />
      </div>
    </div>
  );
}
