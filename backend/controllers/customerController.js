import Customer from "../models/Customer.js";
import Transaction from "../models/Transaction.js";
import { info, error } from "../utils/logger.js";

/**
 * @desc Add new customer
 * @route POST /api/customers
 */
export const addCustomer = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    // Add this check for duplicate email too (optional)
    const existingPhone = await Customer.findOne({ phone });
    const existingEmail = email ? await Customer.findOne({ email }) : null;

    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already exists" });
    }
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // const exists = await Customer.findOne({ phone });
    // if (exists) return res.status(400).json({ message: "Customer already exists" });

    const customer = await Customer.create({ name, phone, email, address });
    info(`New customer added: ${name} (${email || "no email"})`);
    res.status(201).json(customer);
  } catch (err) {
    error(`Add Customer Error: ${err.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc Update customer
 * @route PUT /api/customers/:id
 */
export const updateCustomer = async (req, res) => {
  try {
    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated)
      return res.status(404).json({ message: "Customer not found" });

    info(`Customer updated: ${updated.name} (${updated.email || "no email"})`);
    res.status(200).json(updated);
  } catch (err) {
    error(`Update Customer Error: ${err.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc Get all customers
 * @route GET /api/customers
 */
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.status(200).json(customers);
  } catch (err) {
    error(`Get ALl Customers Error: ${err.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc Get single customer
 * @route GET /api/customers/:id
 */
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (err) {
    error(`Get Customer By Id Error: ${err.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc Delete customer
 * @route DELETE /api/customers/:id
 */
export const deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Customer not found" });
    info(`Customer deleted: ${deleted.name}`);
    res.status(200).json({ message: "Customer deleted" });
  } catch (err) {
    error(`Delete Customer Error: ${err.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc Get transaction history for a customer
 * @route GET /api/customers/:id/transactions
 */
export const getCustomerTransactions = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    const transactions = await Transaction.find({
      customer: req.params.id,
    })
      .sort({ createdAt: -1 })
      .populate("invoice", "invoiceNo totalAmount paymentStatus");

    // If no transactions found, still return empty array (safe)
    res.status(200).json({
      customer: { name: customer.name, phone: customer.phone },
      transactions: transactions.length ? transactions : [],
    });
  } catch (err) {
    error(`Get Customer Transactions Error: ${err.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};
