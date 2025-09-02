const Material = require("../modals/MaterialStock");
const StockOutward = require("../modals/StockOutward");

exports.getAutoStockCalculation = async (req, res) => {
  try {
    // 1️⃣ Group MaterialStock by material_Name
    const groupedStockIn = await Material.aggregate([
      {
        $group: {
          _id: "$material_Name",
          total_stock_in: { $sum: "$purchase_quantity" },
        },
      },
    ]);
    console.log("Step 1 - Grouped Stock In:", groupedStockIn);

    // 2️⃣ Lookup material info
    const stockInWithMaterial = await Material.aggregate([
      {
        $group: {
          _id: "$material_Name",
          total_stock_in: { $sum: "$purchase_quantity" },
        },
      },
      {
        $lookup: {
          from: "materials",
          localField: "_id",
          foreignField: "_id",
          as: "material_info",
        },
      },
    ]);
    console.log("Step 2 - After $lookup:", stockInWithMaterial);

    // 3️⃣ Unwind material info
    const unwoundStockIn = await Material.aggregate([
      {
        $group: {
          _id: "$material_Name",
          total_stock_in: { $sum: "$purchase_quantity" },
        },
      },
      {
        $lookup: {
          from: "materials",
          localField: "_id",
          foreignField: "_id",
          as: "material_info",
        },
      },
      {
        $unwind: "$material_info",
      },
    ]);
    console.log("Step 3 - After $unwind:", unwoundStockIn);

    // 4️⃣ Project only necessary fields
    const projectedStockIn = await Material.aggregate([
      {
        $group: {
          _id: "$material_Name",
          total_stock_in: { $sum: "$purchase_quantity" },
        },
      },
      {
        $lookup: {
          from: "materials",
          localField: "_id",
          foreignField: "_id",
          as: "material_info",
        },
      },
      { $unwind: "$material_info" },
      {
        $project: {
          _id: 1,
          total_stock_in: 1,
          type: "$material_info.type",
          name: "$material_info.name",
          description: "$material_info.description",
          limit: "$material_info.limit",
        },
      },
    ]);
    console.log("Step 4 - After $project:", projectedStockIn);

    // 5️⃣ Aggregate total stock out
    const totalStockOut = await StockOutward.aggregate([
      {
        $group: {
          _id: "$material_Name",
          total_stock_out: { $sum: "$quantity_used" },
        },
      },
    ]);
    console.log("Step 5 - Total Stock Out:", totalStockOut);

    // 6️⃣ Map stock out for lookup
    const stockOutMap = new Map();
    totalStockOut.forEach((item) => stockOutMap.set(item._id.toString(), item.total_stock_out));
    console.log("Step 6 - Stock Out Map:", stockOutMap);

    // 7️⃣ Combine stock in & stock out
    const stockData = projectedStockIn.map((item) => {
      const totalOut = stockOutMap.get(item._id.toString()) || 0;
      const currentStock = item.total_stock_in - totalOut;

      return {
        material_id: item._id,
        type: item.type,
        material_name: item.name,
        description: item.description,
        total_stock_in: item.total_stock_in,
        total_stock_out: totalOut,
        current_stock: currentStock,
        limit: item.limit || "",
      };
    });
    console.log("Step 7 - Final Stock Data:", stockData);

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
