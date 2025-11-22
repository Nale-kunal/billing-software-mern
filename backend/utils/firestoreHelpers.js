/**
 * Helper functions to replicate Mongoose-like operations in Firestore
 */

/**
 * Convert Firestore document to plain object with _id
 */
export const docToObject = (doc) => {
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    _id: doc.id,
    ...data,
    // Convert Firestore Timestamps to Date objects
    createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
  };
};

/**
 * Convert array of Firestore documents to array of objects
 */
export const docsToArray = (docs) => {
  return docs.map((doc) => docToObject(doc));
};

import crypto from "crypto";

/**
 * Generate a new document ID
 */
export const generateId = () => {
  // Firestore will auto-generate IDs, but we can also use this for consistency
  return crypto.randomBytes(16).toString("hex");
};

/**
 * Convert Mongoose query to Firestore query
 * Handles common query patterns
 */
export const buildQuery = (query, collectionRef) => {
  let ref = collectionRef;

  // Handle simple field equality
  Object.keys(query).forEach((key) => {
    if (key === "_id") {
      // _id is handled separately
      return;
    }
    if (typeof query[key] === "object" && query[key] !== null) {
      // Handle operators like $ne, $gt, $lt, etc.
      if (query[key].$ne !== undefined) {
        // Firestore doesn't have $ne directly, we'll filter in memory
        return;
      }
      if (query[key].$gt !== undefined) {
        ref = ref.where(key, ">", query[key].$gt);
      }
      if (query[key].$lt !== undefined) {
        ref = ref.where(key, "<", query[key].$lt);
      }
      if (query[key].$gte !== undefined) {
        ref = ref.where(key, ">=", query[key].$gte);
      }
      if (query[key].$lte !== undefined) {
        ref = ref.where(key, "<=", query[key].$lte);
      }
    } else {
      ref = ref.where(key, "==", query[key]);
    }
  });

  return ref;
};

/**
 * Populate references (similar to Mongoose populate)
 * This is a simplified version - for complex cases, manual population may be needed
 */
export const populate = async (docs, field, collectionName, db, selectFields = null) => {
  if (!docs || docs.length === 0) return docs;

  const populatedDocs = await Promise.all(
    docs.map(async (doc) => {
      if (!doc[field]) return doc;

      const refId = typeof doc[field] === "object" ? doc[field]._id || doc[field].id : doc[field];
      if (!refId) return doc;

      try {
        const refDoc = await db.collection(collectionName).doc(refId).get();
        if (refDoc.exists) {
          const populatedData = docToObject(refDoc);
          if (selectFields) {
            // Select only specified fields
            const selected = {};
            selectFields.forEach((field) => {
              if (populatedData[field] !== undefined) {
                selected[field] = populatedData[field];
              }
            });
            doc[field] = selected;
          } else {
            doc[field] = populatedData;
          }
        }
      } catch (error) {
        console.error(`Error populating ${field}:`, error);
      }

      return doc;
    })
  );

  return populatedDocs;
};

