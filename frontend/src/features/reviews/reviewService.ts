import type { Review, ImportedProfReview, Paginated } from "@/types";
import { env } from "@/config/env";
import { mockImportedProfReviews } from "@/features/entities/mockData";

// Helper for delays
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// API response type from backend
type ApiReview = {
  uuid: string;
  authorName?: string;
  entityId: string;
  description: string;
  voteCount?: number;
  createdAt: string;
  rating: number;
  tags?: string[];
  moduleCode?: string;
  subratings?: Record<string, number | null>;
};

// Convert API review to frontend Review type
function mapApiReview(apiReview: ApiReview): Review {
  return {
    id: apiReview.uuid,
    entityId: apiReview.entityId,
    rating: apiReview.rating,
    text: apiReview.description,
    createdAt: new Date(apiReview.createdAt).getTime(),
    authorName: apiReview.authorName,
    tags: apiReview.tags,
    voteCount: apiReview.voteCount ?? 0,
    moduleCode: apiReview.moduleCode,
    subratings: apiReview.subratings,
  };
}

export async function createReview(review: Omit<Review, "id">) {
  try {
    const payload = {
      authorName: review.authorName || undefined,
      description: review.text,
      entityId: review.entityId,
      rating: review.rating,
      tags: review.tags,
      moduleCode: review.moduleCode,
      subratings: review.subratings,
    };

    const response = await fetch(env.api.createReview, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create review: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return {
      ...review,
      id: data.uuid || data.id || `rev-${Date.now()}`,
      voteCount: 0,
    } as Review;
  } catch (error) {
    console.error("Failed to create review:", error);
    throw error;
  }
}

export async function listReviewsForEntity(entityId: string, _take = 50): Promise<Review[]> {
  try {
    const response = await fetch(`${env.api.getReviews}?entityId=${encodeURIComponent(entityId)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reviews: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle both array and object with reviews property
    let reviews: ApiReview[];
    if (Array.isArray(data)) {
      reviews = data;
    } else if (data && typeof data === "object" && Array.isArray(data.reviews)) {
      reviews = data.reviews;
    } else if (data && typeof data === "object" && Array.isArray(data.data)) {
      reviews = data.data;
    } else {
      console.warn("Unexpected reviews API response format:", data);
      return [];
    }
    
    return reviews.map(mapApiReview);
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return []; // Return empty array on error
  }
}

export async function deleteReview(_reviewId: string) {
  // TODO: Implement delete API when available
  console.warn("Delete review API not yet implemented");
}

// Vote on a review (upvote only) - TODO: implement API
export async function voteReview(_reviewId: string): Promise<number> {
  await delay(150);
  // TODO: Implement vote API when available
  console.warn("Vote review API not yet implemented");
  return 0;
}

// List AI-imported professor reviews (still using mock data)
export async function listImportedProfReviews(profEntityId: string): Promise<ImportedProfReview[]> {
  await delay(250);
  return mockImportedProfReviews.filter(
    (r) => r.profEntityId === profEntityId && !r.markedIrrelevant
  );
}

// Mark an imported review as irrelevant
export async function markImportedReviewIrrelevant(reviewId: string): Promise<void> {
  await delay(150);
  const review = mockImportedProfReviews.find((r) => r.id === reviewId);
  if (review) {
    review.markedIrrelevant = true;
  }
}

// Vote on imported review
export async function voteImportedReview(
  reviewId: string,
  _voteType: "helpful"
): Promise<number> {
  await delay(100);
  const review = mockImportedProfReviews.find((r) => r.id === reviewId);
  if (review) {
    review.helpfulCount += 1;
    return review.helpfulCount;
  }
  return 0;
}

// Paginated reviews from API
export async function listReviews(
  entityId: string,
  params?: { page?: number; pageSize?: number }
): Promise<Paginated<Review>> {
  const { page = 1, pageSize = 10 } = params ?? {};
  
  // Fetch all reviews for entity from API
  const allReviews = await listReviewsForEntity(entityId);
  
  const start = (page - 1) * pageSize;
  const items = allReviews.slice(start, start + pageSize);
  
  return {
    items,
    total: allReviews.length,
    page,
    pageSize,
    hasMore: start + pageSize < allReviews.length,
  };
}
