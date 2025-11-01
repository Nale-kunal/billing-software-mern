import Invoice from "../models/Invoice.js";
import Item from "../models/Item.js";
import Customer from "../models/Customer.js";
import { generateAIReport } from "../utils/aiReportHelper.js";
import { checkStockAlerts } from "../utils/stockAlert.js";
import { info, error } from "../utils/logger.js";

/**
 * @desc Generate Sales Report (daily/weekly/monthly)
 * @route GET /api/reports/sales
 */
export const getSalesReport = async (req, res) => {
  try {
    const invoices = await Invoice.find();
    const items = await Item.find();

    const report = generateAIReport(invoices, items);
    const stockAlerts = await checkStockAlerts();

    info(`Sales report generated with ${report.summary.totalInvoices} invoices`);

    res.status(200).json({ report, stockAlerts });
  } catch (err) {
    error(`Report Generation Error: ${err.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc Get Stock Report
 * @route GET /api/reports/stock
 */
export const getStockReport = async (req, res) => {
  try {
    const items = await Item.find().sort({ stockQty: 1 });
    const lowStock = items.filter((i) => i.stockQty <= i.lowStockLimit);
    res.status(200).json({ totalItems: items.length, lowStock });
  } catch (err) {
    error(`Stock Report Error: ${err.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc Get Customer Dues Report
 * @route GET /api/reports/customers
 */
export const getCustomerReport = async (req, res) => {
  try {
    const customers = await Customer.find({ dues: { $gt: 0 } }).sort({ dues: -1 });
    res.status(200).json(customers);
  } catch (err) {
    error(`Customer Report Error: ${err.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};
