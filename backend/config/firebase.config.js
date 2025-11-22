import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin SDK
let app;
let db;

try {
  // Check if Firebase is already initialized
  if (getApps().length === 0) {
    // Initialize with service account credentials from environment variables
    // For Firebase Admin SDK, we need service account credentials
    // These can be provided as a JSON string in env or as a file path
    
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (serviceAccount) {
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.log(`🔥 Firebase Admin initialized for project: ${process.env.FIREBASE_PROJECT_ID}`);
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // Alternative: Use default credentials (for Firebase Functions or when using Application Default Credentials)
      app = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.log(`🔥 Firebase Admin initialized for project: ${process.env.FIREBASE_PROJECT_ID}`);
    } else {
      console.warn(`⚠️  Firebase credentials not found. Please set FIREBASE_PROJECT_ID and FIREBASE_SERVICE_ACCOUNT in .env`);
      // Create a dummy db object to prevent crashes
      db = null;
    }
  } else {
    app = getApps()[0];
  }

  // Initialize Firestore only if app was created
  if (app) {
    db = getFirestore(app);
    console.log(`📦 Firestore connected successfully`);
  }

} catch (error) {
  console.error(`❌ Firebase Connection Error: ${error.message}`);
  console.error(`⚠️  Server will continue but Firebase operations will fail. Please check your Firebase configuration.`);
  db = null;
}

export default db;

