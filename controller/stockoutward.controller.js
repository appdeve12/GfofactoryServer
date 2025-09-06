const StockOutward = require("../modals/StockOutward");

exports.createStockOutward = async (req, res) => {
  try {
    const userId = req.user.id;
    const { material_Name, quantity_used, purpose, date ,file,quantity_unit} = req.body;

    const stockOutward = new StockOutward({
      material_Name,
      quantity_used,
      purpose,
      date,
      file,
      quantity_unit,
      user: userId,
      status:"pending"
    });

    await stockOutward.save();

    res.status(201).json({
      message: "Stock outward entry created successfully",
      stockOutward,
    });
  } catch (error) {
    console.error("Create Stock Outward Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllStockOutward = async (req, res) => {
  try {
    const { status } = req.query; // Get status from query params

    const query = status ? { status } : {}; // Apply status filter if present

    const stockOutwardEntries = await StockOutward.find(query)
      .populate("user", "name email role")
      .populate("material_Name");

    res.status(200).json({
      message: "Stock outward entries fetched successfully",
      stockOutwardEntries,
    });
  } catch (error) {
    console.error("Get Stock Outward Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.getAllStockperaDMINOutward = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const query = { user: userId };
    if (status) query.status = status; // If status passed, add it to filter

    const stockOutwardEntries = await StockOutward.find(query)
      .populate("user", "name email role")
      .populate("material_Name");

    res.status(200).json({
      message: "Stock outward entries fetched successfully",
      stockOutwardEntries,
    });
  } catch (error) {
    console.error("Get Stock Outward Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateStockOutward = async (req, res) => {
  try {
    const { id } = req.params; // StockOutward ID from URL
    const userId = req.user.id; // Logged-in user
    const {
      material_Name,
      quantity_used,
      purpose,
      date,
      file,
      quantity_unit

    } = req.body;

    // Update the StockOutward entry
    const updatedStock = await StockOutward.findByIdAndUpdate(
      id,
      {
        material_Name,
        quantity_used,
        purpose,
        date,
        file,
        quantity_unit,
        user: userId, // Optional: only update if needed
        status:"pending"
      },
      { new: true } // Return the updated document
    );

    if (!updatedStock) {
      return res.status(404).json({ message: "Stock outward entry not found" });
    }

    res.status(200).json({
      message: "Stock outward entry updated successfully",
      updatedStock,
    });
  } catch (error) {
    console.error("Update Stock Outward Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.getStockOutwardById = async (req, res) => {
  try {
    const { id } = req.params;

    const stockOutward = await StockOutward.findById(id)
      .populate("user", "name email role")
      .populate("material_Name");

    if (!stockOutward) {
      return res.status(404).json({ message: "Stock outward entry not found" });
    }

    res.status(200).json({
      success: true,
      message: "Stock outward entry fetched successfully",
      stockOutward,
    });
  } catch (error) {
    console.error("Get Stock Outward by ID Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// controllers/stockOutwardController.js (add this function)

// Admin marks as done
exports.markStockOutwardDone = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStock = await StockOutward.findByIdAndUpdate(
      id,
      { status: "done" },
      { new: true }
    );

    if (!updatedStock) {
      return res.status(404).json({ message: "Stock outward entry not found" });
    }

    res.status(200).json({
      message: "Stock outward entry marked as done",
      updatedStock,
    });
  } catch (error) {
    console.error("Mark Stock Outward Done Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// User requests edit - changes status back to pending
exports.requestEditStockOutward = async (req, res) => {
  try {
    const { id } = req.params;

    const stockOutward = await StockOutward.findById(id);
    if (!stockOutward) {
      return res.status(404).json({ message: "Stock outward entry not found" });
    }

    // Only allow edit request if current status is done
    if (stockOutward.status !== "done") {
      return res.status(400).json({ message: "Edit request not allowed unless status is done" });
    }

    // Update status back to pending
    stockOutward.status = "pending-approved";
    await stockOutward.save();

    res.status(200).json({
      message: "Edit request sent. Status set to pending.",
      stockOutward,
    });
  } catch (error) {
    console.error("Request Edit Stock Outward Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.requestEditStockOutwardApproved = async (req, res) => {
  try {
    const { id } = req.params;

    const stockOutward = await StockOutward.findById(id);
    if (!stockOutward) {
      return res.status(404).json({ message: "Stock outward entry not found" });
    }

    // Only allow edit -approved request if current status is pending-approved
    if (stockOutward.status !== "pending-approved") {
      return res.status(400).json({ message: "Edit request not allowed unless status is pending-approved" });
    }

    // Update status back to pending
    stockOutward.status = "pending";
    await stockOutward.save();

    res.status(200).json({
      message: "Edit request sent. Status set to pending.",
      stockOutward,
    });
  } catch (error) {
    console.error("Request Edit Stock Outward Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


