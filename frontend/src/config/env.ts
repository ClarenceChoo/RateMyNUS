export const env = {
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
    appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  },
  api: {
    getEntities: "https://get-entities-y7jxj26qkq-as.a.run.app",
    createEntity: "https://create-entity-y7jxj26qkq-as.a.run.app",
    createReview: "https://create-review-y7jxj26qkq-as.a.run.app",
    getReviews: "https://get-reviews-y7jxj26qkq-as.a.run.app",
    voteReview: "https://vote-review-y7jxj26qkq-as.a.run.app",
  },
};
