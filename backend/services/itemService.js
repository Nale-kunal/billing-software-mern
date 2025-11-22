import db from "../config/firebase.config.js";
import { docToObject, docsToArray, buildQuery } from "../utils/firestoreHelpers.js";

const COLLECTION_NAME = "items";

/**
 * Item Service - Replaces Mongoose Item model
 */
class ItemService {
  /**
   * Find one item
   */
  static async findOne(query) {
    try {
      let queryRef = db.collection(COLLECTION_NAME);

      // Handle _id
      if (query._id) {
        const doc = await queryRef.doc(query._id).get();
        if (!doc.exists) return null;
        const item = docToObject(doc);
        // Check other query conditions
        if (query.addedBy && item.addedBy !== query.addedBy) return null;
        return item;
      }

      // Handle other fields
      if (query.addedBy) {
        queryRef = queryRef.where("addedBy", "==", query.addedBy);
      }
      if (query.name) {
        queryRef = queryRef.where("name", "==", query.name);
      }

      const snapshot = await queryRef.limit(1).get();
      if (snapshot.empty) return null;

      return docToObject(snapshot.docs[0]);
    } catch (error) {
      console.error("ItemService.findOne error:", error);
      throw error;
    }
  }

  /**
   * Find items with query
   */
  static async find(query = {}) {
    try {
      let queryRef = db.collection(COLLECTION_NAME);

      // Handle addedBy filter
      if (query.addedBy) {
        queryRef = queryRef.where("addedBy", "==", query.addedBy);
      }

      // Handle $expr queries (like stockQty <= lowStockLimit)
      // These need to be handled after fetching
      const snapshot = await queryRef.get();
      let items = docsToArray(snapshot.docs);

      // Apply $expr filters in memory
      if (query.$expr) {
        const expr = query.$expr;
        if (expr.$lte) {
          const [field1, field2] = expr.$lte;
          items = items.filter((item) => {
            const val1 = item[field1.replace("$", "")];
            const val2 = item[field2.replace("$", "")];
            return val1 <= val2;
          });
        }
      }

      // Sort
      if (query.sort) {
        const sortField = query.sort.replace("-", "");
        const descending = query.sort.startsWith("-");
        items.sort((a, b) => {
          if (descending) {
            return b[sortField] - a[sortField];
          }
          return a[sortField] - b[sortField];
        });
      }

      return items;
    } catch (error) {
      console.error("ItemService.find error:", error);
      throw error;
    }
  }

  /**
   * Create new item
   */
  static async create(itemData) {
    try {
      // Check for duplicate name per owner
      if (itemData.name && itemData.addedBy) {
        const existing = await this.findOne({
          name: itemData.name,
          addedBy: itemData.addedBy,
        });
        if (existing) {
          throw new Error("Item already exists");
        }
      }

      const itemDoc = {
        ...itemData,
        stockQty: itemData.stockQty || 0,
        lowStockLimit: itemData.lowStockLimit || 5,
        unit: itemData.unit || "pcs",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = db.collection(COLLECTION_NAME).doc();
      await docRef.set(itemDoc);

      const created = await docRef.get();
      return docToObject(created);
    } catch (error) {
      console.error("ItemService.create error:", error);
      throw error;
    }
  }

  /**
   * Find by ID
   */
  static async findById(id) {
    try {
      const doc = await db.collection(COLLECTION_NAME).doc(id).get();
      if (!doc.exists) return null;
      return docToObject(doc);
    } catch (error) {
      console.error("ItemService.findById error:", error);
      throw error;
    }
  }

  /**
   * Update item
   */
  static async findByIdAndUpdate(id, updateData, options = {}) {
    try {
      const docRef = db.collection(COLLECTION_NAME).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      const updateObj = {
        ...updateData,
        updatedAt: new Date(),
      };

      await docRef.update(updateObj);

      if (options.new !== false) {
        const updated = await docRef.get();
        return docToObject(updated);
      }

      return docToObject(doc);
    } catch (error) {
      console.error("ItemService.findByIdAndUpdate error:", error);
      throw error;
    }
  }

  /**
   * Delete item
   */
  static async findByIdAndDelete(id) {
    try {
      const docRef = db.collection(COLLECTION_NAME).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      await docRef.delete();
      return docToObject(doc);
    } catch (error) {
      console.error("ItemService.findByIdAndDelete error:", error);
      throw error;
    }
  }

  /**
   * Increment field (equivalent to $inc)
   */
  static async incrementField(id, field, amount) {
    try {
      const docRef = db.collection(COLLECTION_NAME).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error("Item not found");
      }

      const currentValue = doc.data()[field] || 0;
      await docRef.update({
        [field]: currentValue + amount,
        updatedAt: new Date(),
      });

      const updated = await docRef.get();
      return docToObject(updated);
    } catch (error) {
      console.error("ItemService.incrementField error:", error);
      throw error;
    }
  }
}

export default ItemService;

