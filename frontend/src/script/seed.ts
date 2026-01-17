import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import "dotenv/config";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY!,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.VITE_FIREBASE_APP_ID!,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const now = Date.now();

const entities = [
  { type: "DORM", name: "CAPT", subtitle: "UTown", tags: ["community", "rc"], createdAt: now },
  { type: "DORM", name: "Tembusu College", subtitle: "UTown", tags: ["rc"], createdAt: now },
  { type: "CLASSROOM", name: "LT27", subtitle: "Engineering", tags: ["big"], createdAt: now },
  { type: "FOOD_PLACE", name: "The Deck", subtitle: "FASS", tags: ["cheap"], createdAt: now },
  { type: "TOILET", name: "COM2 Level 2 Toilet", subtitle: "SoC", tags: ["aircon?"], createdAt: now },
];

async function run() {
  for (const e of entities) {
    await addDoc(collection(db, "entities"), e);
    console.log("Seeded:", e.type, e.name);
  }
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
