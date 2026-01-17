import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { listReviewsForUser } from "@/features/reviews/reviewService";
import { listBookmarks } from "@/features/entities/entityService";
import ReviewList from "@/features/reviews/ReviewList";
import type { Review, Entity } from "@/types";

type Tab = "reviews" | "bookmarks";

export default function Profile() {
  const { user, loading: authLoading, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("reviews");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookmarks, setBookmarks] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoading(true);
      try {
        if (tab === "reviews") {
          const data = await listReviewsForUser(user.uid);
          setReviews(data);
        } else {
          const data = await listBookmarks();
          setBookmarks(data);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user, tab]);

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (authLoading) {
    return <div className="py-8 text-center text-zinc-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-zinc-500">
            {user?.isAnonymous ? "Anonymous User" : user?.email ?? "User"}
          </p>
        </div>
        <Button variant="ghost" onClick={logout}>
          Logout
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setTab("reviews")}
          className={`px-4 py-2 text-sm font-medium transition ${
            tab === "reviews"
              ? "border-b-2 border-zinc-900 text-zinc-900"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          My Reviews
        </button>
        <button
          onClick={() => setTab("bookmarks")}
          className={`px-4 py-2 text-sm font-medium transition ${
            tab === "bookmarks"
              ? "border-b-2 border-zinc-900 text-zinc-900"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Bookmarks
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-8 text-center text-zinc-500">Loading...</div>
      ) : (
        <>
          {/* Reviews Tab */}
          {tab === "reviews" && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <Card className="py-8 text-center">
                  <div className="text-zinc-500">You haven't written any reviews yet.</div>
                  <Link to="/explore" className="mt-2 inline-block text-blue-600 hover:underline">
                    Start exploring →
                  </Link>
                </Card>
              ) : (
                <ReviewList reviews={reviews} />
              )}
            </div>
          )}

          {/* Bookmarks Tab */}
          {tab === "bookmarks" && (
            <div className="space-y-4">
              {bookmarks.length === 0 ? (
                <Card className="py-8 text-center">
                  <div className="text-zinc-500">No bookmarks yet.</div>
                  <Link to="/explore" className="mt-2 inline-block text-blue-600 hover:underline">
                    Discover places to bookmark →
                  </Link>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {bookmarks.map((entity) => (
                    <Link key={entity.id} to={`/entity/${entity.id}`}>
                      <Card className="group cursor-pointer transition hover:border-zinc-300 hover:shadow-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold group-hover:text-zinc-700">
                              {entity.name}
                            </div>
                            <div className="text-sm text-zinc-500">
                              {entity.subtitle ?? entity.type}
                            </div>
                          </div>
                          {entity.avgRating && (
                            <div className="text-yellow-600">
                              {entity.avgRating.toFixed(1)} ★
                            </div>
                          )}
                        </div>
                        {entity.tags && entity.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {entity.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
