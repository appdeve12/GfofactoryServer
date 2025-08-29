const Material = require("../modals/MaterialStock");
const StockOutward = require("../modals/StockOutward");

exports.getAutoStockCalculation = async (req, res) => {
  try {
    // Aggregate total stock in with material name populated
    const totalStockIn = await Material.aggregate([
      {
        $group: {
          _id: "$material_Name",
          total_stock_in: { $sum: "$purchase_quantity" },
        },
      },
      {
        $lookup: {
          from: "materials", // collection name (lowercase, plural)
          localField: "_id",
          foreignField: "_id",
          as: "material_info",
        },
      },
      {
        $unwind: "$material_info",
      },
      {
        $project: {
          _id: 1,
          total_stock_in: 1,
          name: "$material_info.name",
          description: "$material_info.description",
        },
      },
    ]);

    // Aggregate total stock out
    const totalStockOut = await StockOutward.aggregate([
      {
        $group: {
          _id: "$material_Name",
          total_stock_out: { $sum: "$quantity_used" },
        },
      },
    ]);

    // Map stock out for easy lookup
    const stockOutMap = new Map();
    totalStockOut.forEach((item) => {
      stockOutMap.set(item._id.toString(), item.total_stock_out);
    });

    // Combine and calculate current stock
    const stockData = totalStockIn.map((item) => {
      const idStr = item._id.toString();
      const totalOut = stockOutMap.get(idStr) || 0;
      const currentStock = item.total_stock_in - totalOut;

      return {
        material_id: item._id,
        material_name: item.name,
        description: item.description,
        total_stock_in: item.total_stock_in,
        total_stock_out: totalOut,
        current_stock: currentStock,
      };
    });

    res.status(200).json({
      success: true,
      message: "Stock calculation fetched successfully",
      data: stockData,
    });
  } catch (error) {
    console.error("Auto Stock Calculation Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
