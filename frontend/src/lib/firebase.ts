import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { env } from "@/config/env";

// Check if real Firebase credentials are configured
export const hasRealFirebaseConfig = Boolean(
  env.firebase.apiKey &&
  env.firebase.projectId &&
  !env.firebase.apiKey.includes("your-") &&
  !env.firebase.projectId.includes("your-")
);

const firebaseConfig = {
  apiKey: env.firebase.apiKey || "demo-api-key",
  authDomain: env.firebase.authDomain || "demo.firebaseapp.com",
  projectId: env.firebase.projectId || "demo-project",
  storageBucket: env.firebase.storageBucket || "demo.appspot.com",
  messagingSenderId: env.firebase.messagingSenderId || "000000000000",
  appId: env.firebase.appId || "1:000000000000:web:0000000000000000",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Log connection status in development
if (import.meta.env.DEV) {
  console.log(
    hasRealFirebaseConfig
      ? "🔥 Firebase: Using real credentials"
      : "🧪 Firebase: No credentials found, will use mock data"
  );
}
