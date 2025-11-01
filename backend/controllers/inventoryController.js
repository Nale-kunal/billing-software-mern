import Item from "../models/Item.js";
import { checkStockAlerts } from "../utils/stockAlert.js";
import { info, error } from "../utils/logger.js";

/**
 * @desc Add new item to inventory
 * @route POST /api/inventory
 */
export const addItem = async (req, res) => {
  try {
    console.log(req.body)
    const { name, sku, category, costPrice, sellingPrice, stockQty, lowStockLimit, unit } =
      req.body;

    if (!name || !costPrice || !sellingPrice) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const existing = await Item.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Item already exists" });
    }

    const item = await Item.create({
      name,
      sku,
      category,
      costPrice,
      sellingPrice,
      stockQty,
      lowStockLimit,
      unit,
      addedBy: req.user._id,
    });

    info(`Item added: ${item.name}`);
    const alerts = await checkStockAlerts();

    res.status(201).json({ item, alerts });
  } catch (err) {
    console.error("Add Item Error:", err);
    error(`Add Item Error: ${err.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc Get all items
 * @route GET /api/inventory
 */
export const getAllItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (err) {
    error(`Get All Items Error: ${err.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc Get single item by ID
 * @route GET /api/inventory/:id
 */
export const getSingleItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.status(200).json(item);
  } catch (err) {
    error(`Get Single Item Error: ${err.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc Update item
 * @route PUT /api/inventory/:id
 */
export const updateItem = async (req, res) => {
  try {
    const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Item not found" });

    info(`Item updated: ${updated.name}`);

    const alerts = await checkStockAlerts();
    res.status(200).json({ updated, alerts });
  } catch (err) {
    error(`Update Item Error: ${err.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc Delete item
 * @route DELETE /api/inventory/:id
 */
export const deleteItem = async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Item not found" });

    info(`Item deleted: ${deleted.name}`);
    res.status(200).json({ message: "Item deleted" });
  } catch (err) {
    error(`Delete Item Error: ${err.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc Get low-stock items
 * @route GET /api/inventory/low-stock
 */
export const getLowStockItems = async (req, res) => {
  try {
    const items = await Item.find({
      $expr: { $lte: ["$stockQty", "$lowStockLimit"] },
    });
    res.status(200).json(items);
  } catch (err) {
    error(`Low Stock Item Error: ${err.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};

