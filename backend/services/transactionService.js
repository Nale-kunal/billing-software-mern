import db from "../config/firebase.config.js";
import { docToObject, docsToArray, populate } from "../utils/firestoreHelpers.js";

const COLLECTION_NAME = "transactions";

/**
 * Transaction Service - Replaces Mongoose Transaction model
 */
class TransactionService {
  /**
   * Find transactions with query
   */
  static async find(query = {}) {
    try {
      let queryRef = db.collection(COLLECTION_NAME);

      // Handle customer filter
      if (query.customer) {
        queryRef = queryRef.where("customer", "==", query.customer);
      }

      // Handle invoice filter
      if (query.invoice) {
        queryRef = queryRef.where("invoice", "==", query.invoice);
      }

      const snapshot = await queryRef.get();
      let transactions = docsToArray(snapshot.docs);

      // Sort
      if (query.sort) {
        const sortField = query.sort.replace("-", "");
        const descending = query.sort.startsWith("-");
        transactions.sort((a, b) => {
          const aVal = a[sortField];
          const bVal = b[sortField];
          if (descending) {
            return bVal > aVal ? 1 : -1;
          }
          return aVal > bVal ? 1 : -1;
        });
      }

      return transactions;
    } catch (error) {
      console.error("TransactionService.find error:", error);
      throw error;
    }
  }

  /**
   * Create new transaction
   */
  static async create(transactionData) {
    try {
      const transactionDoc = {
        ...transactionData,
        paymentMethod: transactionData.paymentMethod || "cash",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = db.collection(COLLECTION_NAME).doc();
      await docRef.set(transactionDoc);

      const created = await docRef.get();
      return docToObject(created);
    } catch (error) {
      console.error("TransactionService.create error:", error);
      throw error;
    }
  }

  /**
   * Populate invoice field (similar to .populate("invoice", "invoiceNo totalAmount paymentStatus"))
   */
  static async populateInvoice(transaction, selectFields = null) {
    if (!transaction.invoice) return transaction;

    try {
      const invoiceDoc = await db.collection("invoices").doc(transaction.invoice).get();
      if (invoiceDoc.exists) {
        if (selectFields) {
          const invoiceData = invoiceDoc.data();
          const selected = {};
          selectFields.forEach((field) => {
            if (invoiceData[field] !== undefined) {
              selected[field] = invoiceData[field];
            }
          });
          selected._id = invoiceDoc.id;
          transaction.invoice = selected;
        } else {
          transaction.invoice = docToObject(invoiceDoc);
        }
      }
      return transaction;
    } catch (error) {
      console.error("TransactionService.populateInvoice error:", error);
      return transaction;
    }
  }
}

export default TransactionService;

