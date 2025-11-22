import db from "../config/firebase.config.js";
import { docToObject, docsToArray, populate } from "../utils/firestoreHelpers.js";

const COLLECTION_NAME = "invoices";

/**
 * Invoice Service - Replaces Mongoose Invoice model
 */
class InvoiceService {
  /**
   * Find one invoice
   */
  static async findOne(query) {
    try {
      let queryRef = db.collection(COLLECTION_NAME);

      // Handle _id
      if (query._id) {
        const doc = await queryRef.doc(query._id).get();
        if (!doc.exists) return null;
        const invoice = docToObject(doc);
        // Check other query conditions
        if (query.createdBy && invoice.createdBy !== query.createdBy) return null;
        return invoice;
      }

      // Handle other fields
      if (query.createdBy) {
        queryRef = queryRef.where("createdBy", "==", query.createdBy);
      }
      if (query.invoiceNo) {
        queryRef = queryRef.where("invoiceNo", "==", query.invoiceNo);
      }

      const snapshot = await queryRef.limit(1).get();
      if (snapshot.empty) return null;

      return docToObject(snapshot.docs[0]);
    } catch (error) {
      console.error("InvoiceService.findOne error:", error);
      throw error;
    }
  }

  /**
   * Find invoices with query
   */
  static async find(query = {}) {
    try {
      let queryRef = db.collection(COLLECTION_NAME);

      // Handle createdBy filter
      if (query.createdBy) {
        queryRef = queryRef.where("createdBy", "==", query.createdBy);
      }

      const snapshot = await queryRef.get();
      let invoices = docsToArray(snapshot.docs);

      // Sort
      if (query.sort) {
        const sortField = query.sort.replace("-", "");
        const descending = query.sort.startsWith("-");
        invoices.sort((a, b) => {
          const aVal = a[sortField];
          const bVal = b[sortField];
          if (descending) {
            return bVal > aVal ? 1 : -1;
          }
          return aVal > bVal ? 1 : -1;
        });
      }

      return invoices;
    } catch (error) {
      console.error("InvoiceService.find error:", error);
      throw error;
    }
  }

  /**
   * Create new invoice
   */
  static async create(invoiceData) {
    try {
      const invoiceDoc = {
        ...invoiceData,
        customer: invoiceData.customer || null,
        items: invoiceData.items || [],
        discount: invoiceData.discount || 0,
        paidAmount: invoiceData.paidAmount || 0,
        paymentStatus: invoiceData.paymentStatus || "unpaid",
        paymentMethod: invoiceData.paymentMethod || "cash",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = db.collection(COLLECTION_NAME).doc();
      await docRef.set(invoiceDoc);

      const created = await docRef.get();
      return docToObject(created);
    } catch (error) {
      console.error("InvoiceService.create error:", error);
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
      console.error("InvoiceService.findById error:", error);
      throw error;
    }
  }

  /**
   * Count documents
   */
  static async countDocuments(query = {}) {
    try {
      let queryRef = db.collection(COLLECTION_NAME);

      if (query.createdBy) {
        queryRef = queryRef.where("createdBy", "==", query.createdBy);
      }

      const snapshot = await queryRef.get();
      return snapshot.size;
    } catch (error) {
      console.error("InvoiceService.countDocuments error:", error);
      throw error;
    }
  }

  /**
   * Populate customer field (similar to .populate("customer"))
   */
  static async populateCustomer(invoice) {
    if (!invoice.customer) return invoice;

    try {
      const customerDoc = await db.collection("customers").doc(invoice.customer).get();
      if (customerDoc.exists) {
        const customer = docToObject(customerDoc);
        invoice.customer = customer;
      }
      return invoice;
    } catch (error) {
      console.error("InvoiceService.populateCustomer error:", error);
      return invoice;
    }
  }

  /**
   * Populate with select fields (similar to .populate("customer", "name phone"))
   */
  static async populateCustomerWithSelect(invoice, selectFields) {
    if (!invoice.customer) return invoice;

    try {
      const customerDoc = await db.collection("customers").doc(invoice.customer).get();
      if (customerDoc.exists) {
        const customerData = customerDoc.data();
        const selected = {};
        selectFields.forEach((field) => {
          if (customerData[field] !== undefined) {
            selected[field] = customerData[field];
          }
        });
        selected._id = customerDoc.id;
        invoice.customer = selected;
      }
      return invoice;
    } catch (error) {
      console.error("InvoiceService.populateCustomerWithSelect error:", error);
      return invoice;
    }
  }

  /**
   * Delete invoice
   */
  static async deleteOne(query) {
    try {
      const invoice = await this.findOne(query);
      if (!invoice) {
        return null;
      }

      await db.collection(COLLECTION_NAME).doc(invoice._id).delete();
      return invoice;
    } catch (error) {
      console.error("InvoiceService.deleteOne error:", error);
      throw error;
    }
  }
}

export default InvoiceService;

