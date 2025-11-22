import db from "../config/firebase.config.js";
import { docToObject, docsToArray } from "../utils/firestoreHelpers.js";

const COLLECTION_NAME = "customers";

/**
 * Customer Service - Replaces Mongoose Customer model
 */
class CustomerService {
  /**
   * Find one customer
   */
  static async findOne(query) {
    try {
      let queryRef = db.collection(COLLECTION_NAME);

      // Handle _id
      if (query._id) {
        const doc = await queryRef.doc(query._id).get();
        if (!doc.exists) return null;
        const customer = docToObject(doc);
        // Check other query conditions
        if (query.owner && customer.owner !== query.owner) return null;
        return customer;
      }

      // Handle other fields
      if (query.owner) {
        queryRef = queryRef.where("owner", "==", query.owner);
      }
      if (query.phone) {
        queryRef = queryRef.where("phone", "==", query.phone);
      }
      if (query.email) {
        queryRef = queryRef.where("email", "==", query.email.toLowerCase());
      }
      if (query.dues) {
        if (query.dues.$gt !== undefined) {
          queryRef = queryRef.where("dues", ">", query.dues.$gt);
        }
      }

      const snapshot = await queryRef.limit(1).get();
      if (snapshot.empty) return null;

      return docToObject(snapshot.docs[0]);
    } catch (error) {
      console.error("CustomerService.findOne error:", error);
      throw error;
    }
  }

  /**
   * Find customers with query
   */
  static async find(query = {}) {
    try {
      let queryRef = db.collection(COLLECTION_NAME);

      // Handle owner filter
      if (query.owner) {
        queryRef = queryRef.where("owner", "==", query.owner);
      }

      // Handle dues filter
      if (query.dues && query.dues.$gt !== undefined) {
        queryRef = queryRef.where("dues", ">", query.dues.$gt);
      }

      const snapshot = await queryRef.get();
      let customers = docsToArray(snapshot.docs);

      // Sort
      if (query.sort) {
        const sortField = query.sort.replace("-", "");
        const descending = query.sort.startsWith("-");
        customers.sort((a, b) => {
          if (descending) {
            return b[sortField] > a[sortField] ? 1 : -1;
          }
          return a[sortField] > b[sortField] ? 1 : -1;
        });
      }

      return customers;
    } catch (error) {
      console.error("CustomerService.find error:", error);
      throw error;
    }
  }

  /**
   * Create new customer
   */
  static async create(customerData) {
    try {
      // Check for duplicate phone per owner
      if (customerData.phone && customerData.owner) {
        const existing = await this.findOne({
          phone: customerData.phone,
          owner: customerData.owner,
        });
        if (existing) {
          throw new Error("Phone number already exists");
        }
      }

      const customerDoc = {
        ...customerData,
        email: customerData.email ? customerData.email.toLowerCase().trim() : "",
        dues: customerData.dues || 0,
        transactionHistory: customerData.transactionHistory || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = db.collection(COLLECTION_NAME).doc();
      await docRef.set(customerDoc);

      const created = await docRef.get();
      return docToObject(created);
    } catch (error) {
      console.error("CustomerService.create error:", error);
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
      console.error("CustomerService.findById error:", error);
      throw error;
    }
  }

  /**
   * Update customer
   */
  static async findByIdAndUpdate(id, updateData, options = {}) {
    try {
      const docRef = db.collection(COLLECTION_NAME).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      // Lowercase email if provided
      if (updateData.email) {
        updateData.email = updateData.email.toLowerCase().trim();
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
      console.error("CustomerService.findByIdAndUpdate error:", error);
      throw error;
    }
  }

  /**
   * Delete customer
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
      console.error("CustomerService.findByIdAndDelete error:", error);
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
        throw new Error("Customer not found");
      }

      const currentValue = doc.data()[field] || 0;
      await docRef.update({
        [field]: currentValue + amount,
        updatedAt: new Date(),
      });

      const updated = await docRef.get();
      return docToObject(updated);
    } catch (error) {
      console.error("CustomerService.incrementField error:", error);
      throw error;
    }
  }
}

export default CustomerService;

