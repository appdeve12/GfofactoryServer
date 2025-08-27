const Material = require("../modals/MaterialStock");
const StockOutward = require("../modals/StockOutward");

exports.getAutoStockCalculation = async (req, res) => {
  try {
    // Aggregate total stock in by material
    const totalStockIn = await Material.aggregate([
      {
        $group: {
          _id: "$material_Name",
          total_stock_in: { $sum: "$purchase_quantity" },
        },
      },
    ]);

    // Aggregate total stock out by material
    const totalStockOut = await StockOutward.aggregate([
      {
        $group: {
          _id: "$material_Name",
          total_stock_out: { $sum: "$quantity_used" },
        },
      },
    ]);

    // Convert stock out array to Map for quick lookup
    const stockOutMap = new Map();
    totalStockOut.forEach((item) => {
      stockOutMap.set(item._id, item.total_stock_out);
    });

    // Prepare final data combining in & out
    const stockData = totalStockIn.map((item) => {
      const material = item._id;
      const totalIn = item.total_stock_in;
      const totalOut = stockOutMap.get(material) || 0;
      const currentStock = totalIn - totalOut;

      return {
        material_Name: material,
        total_stock_in: totalIn,
        total_stock_out: totalOut,
        current_stock: currentStock,
      };
    });

    res.status(200).json({
      message: "Stock calculation fetched successfully",
      data: stockData,
    });
  } catch (error) {
    console.error("Auto Stock Calculation Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
