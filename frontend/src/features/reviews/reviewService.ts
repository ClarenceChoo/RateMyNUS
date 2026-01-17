import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Review, ImportedProfReview, Paginated } from "@/types";
import { mockReviews, mockImportedProfReviews, delay } from "@/features/entities/mockData";

// TODO: Replace mock with real Firebase calls when backend is ready
const USE_MOCK = true;

export async function createReview(review: Omit<Review, "id">) {
  if (USE_MOCK) {
    await delay(300);
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      helpfulCount: 0,
      unhelpfulCount: 0,
    };
    mockReviews.unshift(newReview);
    return newReview;
  }
  await addDoc(collection(db, "reviews"), review);
}

export async function listReviewsForEntity(entityId: string, take = 50): Promise<Review[]> {
  if (USE_MOCK) {
    await delay(200);
    return mockReviews
      .filter((r) => r.entityId === entityId)
      .slice(0, take);
  }
  const q = query(
    collection(db, "reviews"),
    where("entityId", "==", entityId),
    orderBy("createdAt", "desc"),
    limit(take)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, "id">) }));
}

export async function listReviewsForUser(authorId: string, take = 50): Promise<Review[]> {
  if (USE_MOCK) {
    await delay(200);
    return mockReviews
      .filter((r) => r.authorId === authorId)
      .slice(0, take);
  }
  const q = query(
    collection(db, "reviews"),
    where("authorId", "==", authorId),
    orderBy("createdAt", "desc"),
    limit(take)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, "id">) }));
}

export async function deleteReview(reviewId: string) {
  if (USE_MOCK) {
    await delay(200);
    const idx = mockReviews.findIndex((r) => r.id === reviewId);
    if (idx !== -1) mockReviews.splice(idx, 1);
    return;
  }
  await deleteDoc(doc(db, "reviews", reviewId));
}

// New: Vote on a review (helpful / unhelpful)
export async function voteReview(
  reviewId: string,
  voteType: "helpful" | "unhelpful"
): Promise<{ helpfulCount: number; unhelpfulCount: number }> {
  await delay(150);
  
  const review = mockReviews.find((r) => r.id === reviewId);
  if (review) {
    if (voteType === "helpful") {
      review.helpfulCount = (review.helpfulCount ?? 0) + 1;
    } else {
      review.unhelpfulCount = (review.unhelpfulCount ?? 0) + 1;
    }
    return {
      helpfulCount: review.helpfulCount ?? 0,
      unhelpfulCount: review.unhelpfulCount ?? 0,
    };
  }
  
  return { helpfulCount: 0, unhelpfulCount: 0 };
}

// New: List AI-imported professor reviews
export async function listImportedProfReviews(profEntityId: string): Promise<ImportedProfReview[]> {
  await delay(250);
  return mockImportedProfReviews.filter(
    (r) => r.profEntityId === profEntityId && !r.markedIrrelevant
  );
}

// New: Mark an imported review as irrelevant
export async function markImportedReviewIrrelevant(reviewId: string): Promise<void> {
  await delay(150);
  const review = mockImportedProfReviews.find((r) => r.id === reviewId);
  if (review) {
    review.markedIrrelevant = true;
  }
}

// New: Vote on imported review
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

// New: Paginated reviews
export async function listReviews(
  entityId: string,
  params?: { page?: number; pageSize?: number }
): Promise<Paginated<Review>> {
  await delay(200);
  const { page = 1, pageSize = 10 } = params ?? {};
  
  const allReviews = mockReviews.filter((r) => r.entityId === entityId);
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
