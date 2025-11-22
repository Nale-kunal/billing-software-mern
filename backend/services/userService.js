import db from "../config/firebase.config.js";
import bcrypt from "bcryptjs";
import { docToObject, docsToArray } from "../utils/firestoreHelpers.js";

const COLLECTION_NAME = "users";

/**
 * User Service - Replaces Mongoose User model
 */
class UserService {
  /**
   * Find user by email
   * @param {Object} query - Query object
   * @param {Boolean} includePassword - Whether to include password in result
   */
  static async findOne(query, includePassword = false) {
    try {
      if (!db) {
        throw new Error("Firebase not initialized. Please check your Firebase configuration.");
      }
      let queryRef = db.collection(COLLECTION_NAME);

      // Handle email query
      if (query.email) {
        queryRef = queryRef.where("email", "==", query.email.toLowerCase());
      }

      const snapshot = await queryRef.limit(1).get();
      if (snapshot.empty) return null;

      const user = docToObject(snapshot.docs[0]);
      
      // Remove password unless explicitly requested
      if (!includePassword) {
        delete user.password;
      }
      
      return user;
    } catch (error) {
      console.error("UserService.findOne error:", error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    try {
      if (!db) {
        throw new Error("Firebase not initialized. Please check your Firebase configuration.");
      }
      const doc = await db.collection(COLLECTION_NAME).doc(id).get();
      if (!doc.exists) return null;
      return docToObject(doc);
    } catch (error) {
      console.error("UserService.findById error:", error);
      throw error;
    }
  }

  /**
   * Create new user
   */
  static async create(userData) {
    try {
      if (!db) {
        throw new Error("Firebase not initialized. Please check your Firebase configuration.");
      }
      const { password, email, ...otherData } = userData;

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userDoc = {
        ...otherData,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: userData.role || "owner",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Check if email already exists
      const existing = await this.findOne({ email: userDoc.email });
      if (existing) {
        throw new Error("User already exists");
      }

      const docRef = db.collection(COLLECTION_NAME).doc();
      await docRef.set(userDoc);

      const createdUser = await docRef.get();
      const user = docToObject(createdUser);

      // Remove password from returned object
      delete user.password;
      return user;
    } catch (error) {
      console.error("UserService.create error:", error);
      throw error;
    }
  }

  /**
   * Match password (equivalent to user.matchPassword)
   */
  static async matchPassword(enteredPassword, hashedPassword) {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }

  /**
   * Update user
   */
  static async findByIdAndUpdate(id, updateData, options = {}) {
    try {
      const docRef = db.collection(COLLECTION_NAME).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      // Handle password update
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }

      // Lowercase email if provided
      if (updateData.email) {
        updateData.email = updateData.email.toLowerCase();
      }

      const updateObj = {
        ...updateData,
        updatedAt: new Date(),
      };

      await docRef.update(updateObj);

      if (options.new !== false) {
        const updated = await docRef.get();
        const user = docToObject(updated);
        if (options.select === "-password") {
          delete user.password;
        }
        return user;
      }

      return docToObject(doc);
    } catch (error) {
      console.error("UserService.findByIdAndUpdate error:", error);
      throw error;
    }
  }
}

export default UserService;

