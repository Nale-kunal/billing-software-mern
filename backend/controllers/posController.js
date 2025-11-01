import Invoice from "../models/Invoice.js";
import Item from "../models/Item.js";
import Customer from "../models/Customer.js";
import Transaction from "../models/Transaction.js";
import { generateInvoicePDF } from "../utils/invoiceGenerator.js";
import { sendEmail } from "../utils/emailService.js";
import { info, error } from "../utils/logger.js";

/**
 * @desc Create a new invoice (Billing)
 * @route POST /api/pos/invoice
 */
export const createInvoice = async (req, res) => {
  try {
    const { customerId, items, discount = 0, paidAmount = 0, paymentMethod } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "No items in invoice" });

    // Calculate totals
    let subtotal = 0;
    for (const it of items) subtotal += it.quantity * it.price;
    const totalAmount = subtotal - discount;

    // Create invoice number (ex: INV-00001)
    const count = await Invoice.countDocuments();
    const invoiceNo = `INV-${String(count + 1).padStart(5, "0")}`;

    // Save invoice
    const invoice = await Invoice.create({
      invoiceNo,
      customer: customerId || null,
      items,
      subtotal,
      discount,
      totalAmount,
      paidAmount,
      paymentMethod,
      paymentStatus:
        paidAmount >= totalAmount ? "paid" : paidAmount > 0 ? "partial" : "unpaid",
      createdBy: req.user._id,
    });

    // Update stock
    for (const it of items) {
      await Item.findByIdAndUpdate(it.item, { $inc: { stockQty: -it.quantity } });
    }

    // Handle customer dues if unpaid
    if (customerId && paidAmount < totalAmount) {
      const dueAmount = totalAmount - paidAmount;
      await Customer.findByIdAndUpdate(customerId, { $inc: { dues: dueAmount } });

      await Transaction.create({
        type: "due",
        customer: customerId,
        invoice: invoice._id,
        amount: dueAmount,
        description: `Due added for invoice ${invoiceNo}`,
      });
    }

    // Record payment transaction
    if (paidAmount > 0) {
      await Transaction.create({
        type: "payment",
        customer: customerId,
        invoice: invoice._id,
        amount: paidAmount,
        paymentMethod,
        description: `Payment received for invoice ${invoiceNo}`,
      });
    }

    // --- 🔽 NEW: Generate invoice PDF + Email it + Log it ---
    const populatedInvoice = await Invoice.findById(invoice._id).populate("customer");
    const pdfPath = await generateInvoicePDF(populatedInvoice);

    if (populatedInvoice.customer?.email) {
      await sendEmail(
        populatedInvoice.customer.email,
        `Invoice ${invoiceNo}`,
        `Thank you for your purchase! Attached is your invoice ${invoiceNo}.`,
        pdfPath
      );
    }

    info(`Invoice generated and emailed: ${invoiceNo}`);

    res.status(201).json({ message: "Invoice created successfully", invoice });
  } catch (err) {
    error(`Invoice creation failed: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};


/**
 * @desc Get all invoices
 * @route GET /api/pos/invoices
 */
export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("customer", "name phone")
      .sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc Get single invoice
 * @route GET /api/pos/invoice/:id
 */
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("customer");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc Delete invoice
 * @route DELETE /api/pos/invoice/:id
 */
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    await invoice.deleteOne();
    res.status(200).json({ message: "Invoice deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
