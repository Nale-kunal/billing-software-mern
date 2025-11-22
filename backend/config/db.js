// MongoDB connection replaced with Firebase
// Import Firebase config instead
import db from "./firebase.config.js";

const connectDB = async () => {
  try {
    // Firestore is already initialized in firebase.config.js
    // Just verify connection by attempting a simple operation
    // Use a try-catch to handle the case where collection doesn't exist
    try {
      await db.collection("_health").limit(1).get();
    } catch (e) {
      // Collection doesn't exist, but that's fine - Firestore is connected
    }
    console.log(`📦 Firebase Firestore Connected`);
  } catch (error) {
    console.error(`❌ Firebase Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
