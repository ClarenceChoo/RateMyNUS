import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Entity, EntityType } from "@/types";

export async function getEntity(entityId: string): Promise<Entity | null> {
  const snap = await getDoc(doc(db, "entities", entityId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Entity, "id">) };
}

export async function listEntitiesByType(type: EntityType, take = 30): Promise<Entity[]> {
  const q = query(collection(db, "entities"), where("type", "==", type), limit(take));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Entity, "id">) }));
}
