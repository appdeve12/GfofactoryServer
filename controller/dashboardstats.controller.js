// const Material = require("../modals/MaterialStock");
// const StockOutward = require("../modals/StockOutward");
// const MaterialModel=require("../modals/Material")

// exports.getAutoStockCalculation = async (req, res) => {
//   try {
//     // 1️⃣ Group MaterialStock by material_Name
//     const groupedStockIn = await Material.aggregate([
//       {
//         $group: {
//           _id: "$material_Name",
//           total_stock_in: { $sum: "$purchase_quantity" },
//         },
//       },
//     ]);
//     console.log("Step 1 - Grouped Stock In:", groupedStockIn);

//     // 2️⃣ Lookup material info
//     const stockInWithMaterial = await Material.aggregate([
//       {
//         $group: {
//           _id: "$material_Name",
//           total_stock_in: { $sum: "$purchase_quantity" },
//         },
//       },
//       {
//         $lookup: {
//           from: "materials",
//           localField: "_id",
//           foreignField: "_id",
//           as: "material_info",
//         },
//       },
//     ]);
//     console.log("Step 2 - After $lookup:", stockInWithMaterial);

//     // 3️⃣ Unwind material info
//     const unwoundStockIn = await Material.aggregate([
//       {
//         $group: {
//           _id: "$material_Name",
//           total_stock_in: { $sum: "$purchase_quantity" },
//         },
//       },
//       {
//         $lookup: {
//           from: "materials",
//           localField: "_id",
//           foreignField: "_id",
//           as: "material_info",
//         },
//       },
//       {
//         $unwind: "$material_info",
//       },
//     ]);
//     console.log("Step 3 - After $unwind:", unwoundStockIn);

//     // 4️⃣ Project only necessary fields
//     const projectedStockIn = await Material.aggregate([
//       {
//         $group: {
//           _id: "$material_Name",
//           total_stock_in: { $sum: "$purchase_quantity" },
//         },
//       },
//       {
//         $lookup: {
//           from: "materials",
//           localField: "_id",
//           foreignField: "_id",
//           as: "material_info",
//         },
//       },
//       { $unwind: "$material_info" },
//       {
//         $project: {
//           _id: 1,
//           total_stock_in: 1,
//           type: "$material_info.type",
//           name: "$material_info.name",
//           description: "$material_info.description",
//           limit: "$material_info.limit",
//           isOrdered:"$material_info.isOrdered"
//         },
//       },
//     ]);
//     console.log("Step 4 - After $project:", projectedStockIn);

//     // 5️⃣ Aggregate total stock out
//     const totalStockOut = await StockOutward.aggregate([
//       {
//         $group: {
//           _id: "$material_Name",
//           total_stock_out: { $sum: "$quantity_used" },
//         },
//       },
//     ]);
//     console.log("Step 5 - Total Stock Out:", totalStockOut);

//     // 6️⃣ Map stock out for lookup
//     const stockOutMap = new Map();
//     totalStockOut.forEach((item) => stockOutMap.set(item._id.toString(), item.total_stock_out));
//     console.log("Step 6 - Stock Out Map:", stockOutMap);

//     // 7️⃣ Combine stock in & stock out
//     const stockData = projectedStockIn.map((item) => {
//       const totalOut = stockOutMap.get(item._id.toString()) || 0;
//       const currentStock = item.total_stock_in - totalOut;

//       return {
//         material_id: item._id,
//         type: item.type,
//         material_name: item.name,
//         description: item.description,
//         total_stock_in: item.total_stock_in,
//         total_stock_out: totalOut,
//         current_stock: currentStock,
//         limit: item.limit || "",
//         isOrdered:item.isOrdered || false
//       };
//     });
//     console.log("Step 7 - Final Stock Data:", stockData);

//     res.status(200).json({
//       success: true,
//       message: "Stock calculation fetched successfully",
//       data: stockData,
//     });
//   } catch (error) {
//     console.error("Auto Stock Calculation Error:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
const MaterialStock = require("../modals/MaterialStock");
const StockOutward = require("../modals/StockOutward");
const Material = require("../modals/Material");

exports.getAutoStockCalculation = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
console.log("userId","userRole",userId,userRole)
    const materialMatch = {};

    // Filter materials by createdBy if user is NOT a supervisor
    if (userRole !== "supervisior") {
      materialMatch.createdBy = userId;
    }
console.log(materialMatch)
    // Get the materials the user has access to
    const materials = await Material.find(materialMatch).select("_id name type description limit isOrdered limit_unit");
console.log("materials",materials)
    const materialIds = materials.map((m) => m._id);

    // Aggregate total stock-in by material
    const stockIn = await MaterialStock.aggregate([
      {
        $match: {
          material_Name: { $in: materialIds },
        },
      },
      {
        $group: {
          _id: "$material_Name",
          total_stock_in: { $sum: "$purchase_quantity" },
             purchase_unit: { $first: "$purchase_unit" }
        },
      },
    ]);

    // Aggregate total stock-out by material
    const stockOut = await StockOutward.aggregate([
      {
        $match: {
          material_Name: { $in: materialIds },
        },
      },
      {
        $group: {
          _id: "$material_Name",
          total_stock_out: { $sum: "$quantity_used" },
           quantity_unit: { $first: "$quantity_unit" }
        },
      },
    ]);

    // Convert aggregations to maps for quick lookup
const stockInMap = new Map(
  stockIn.map((item) => [
    item._id.toString(),
    { total: item.total_stock_in, unit: item.purchase_unit }
  ])
);

const stockOutMap = new Map(
  stockOut.map((item) => [
    item._id.toString(),
    { total: item.total_stock_out, unit: item.quantity_unit }
  ])
);
console.log("stockInMap",stockInMap)
console.log("stockOutMap",stockOutMap)
    // Combine material info + stock calculations
    const stockData = materials.map((material) => {
      console.log("material",material)
      const idStr = material._id.toString();
      const totalIn = stockInMap.get(idStr) || 0;
      const totalOut = stockOutMap.get(idStr) || 0;
   const currentStock = {
  total: totalIn.total - totalOut.total,
  unit: totalIn.unit // हमेशा same रहेगा क्योंकि ek material ek hi unit
};

console.log("Current Stock:", currentStock);

      return {
        material_id: material._id,
        type: material.type,
        material_name: material.name,
        description: material.description,
        total_stock_in: totalIn,
        total_stock_out: totalOut,
        current_stock: currentStock,
        limit: material.limit || "",
        limit_unit:material.limit_unit || "",
        isOrdered: material.isOrdered || false,
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
