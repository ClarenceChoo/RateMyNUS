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
import type { Review } from "@/types";

export async function createReview(review: Omit<Review, "id">) {
  await addDoc(collection(db, "reviews"), review);
}

export async function listReviewsForEntity(entityId: string, take = 50): Promise<Review[]> {
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
  await deleteDoc(doc(db, "reviews", reviewId));
}
