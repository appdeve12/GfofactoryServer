const StockOutward = require("../modals/StockOutward");

exports.createStockOutward = async (req, res) => {
  try {
    const userId = req.user.id;
    const { material_Name, quantity_used, purpose, date } = req.body;

    const stockOutward = new StockOutward({
      material_Name,
      quantity_used,
      purpose,
      date,
      user: userId,
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
    const stockOutwardEntries = await StockOutward.find().populate("user", "name email role").populate("material_Name");
    res.status(200).json({
      message: "Stock outward entries fetched successfully",
      stockOutwardEntries,
    });
  } catch (error) {
    console.error("Get Stock Outward Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
