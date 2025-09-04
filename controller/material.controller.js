const Material = require("../modals/MaterialStock");
const MaterialData=require("../modals/Material")
exports.getMaterialHistory = async (req, res) => {
  try {
    const { materialId } = req.params;

    // 1. Verify material exists
    const material = await MaterialData.findById(materialId);
    if (!material) {
      return res.status(404).json({ success: false, message: "Material not found" });
    }

    // 2. Fetch stock history (who supplied, when, how much, cost)
    const stockHistory = await Material.find({ material_Name: materialId })
      .populate("user", "name email role") // who added the stock
      .sort({ purchase_date: -1 }) // latest first
      .lean();

    return res.status(200).json({
      success: true,
      material: {
        id: material._id,
        name: material.name,
        type: material.type,
        limit: material.limit,
      },
      history: stockHistory.map(stock => ({
        id: stock._id,
        purchase_quantity: stock.purchase_quantity,
        purchase_date: stock.purchase_date,
        supplier: stock.supplier,
        cost: stock.cost,
        remarks: stock.remarks,
        addedBy: stock.user?.name || "N/A",
        status: stock.status,
      })),
    });
  } catch (error) {
    console.error("Error fetching material history:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.createMaterialEntry = async (req, res) => {
  try {
    console.log("he;p")
    const userId = req.user.id;
    console.log("userId",userId)
    const { material_Name, purchase_quantity, purchase_date, supplier, file, remarks,cost } = req.body;

   const  createdByRole= req.user.role;


    const material = new Material({
      material_Name,
      purchase_quantity,
      purchase_date,
      supplier,
      file,
      remarks,
      cost,
      user: userId,
            status:"draft",
            createdByRole:createdByRole
    });

    await material.save();

    res.status(201).json({
      message: "Material added successfully",
      material,
    });
  } catch (error) {
    console.error("Create Material Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.markAsDone = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findById(id);

    if (!material) return res.status(404).json({ message: "Not Found" });

    if (!["draft", "edit-approved"].includes(material.status)) {
      return res.status(400).json({ message: "Cannot mark as done from current status" });
    }

    material.status = "done";
    await material.save();

    res.json({ message: "Marked as done", material });
  } catch (error) {
    console.error("Mark As Done Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.makeEditRequest = async (req, res) => {
  try {

    const { id } = req.params;
    const adminId = req.user.id;
    console.log("id adminId",adminId,id)

    const material = await Material.findById(id);
    console.log("material",material)
   

    material.status = "request-pending";
    material.requestBy = adminId;
    await material.save();
    console.log("saved")

    res.json({ message: "Edit request sent to supervisor", material });
  } catch (error) {
    console.error("Make Edit Request Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.approveEditRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const supervisorId = req.user.id;

    const material = await Material.findById(id)
      .populate("user", "name email role")
      .populate("material_Name");

    if (!material || material.status !== "request-pending" && material.status !== "review") {
      return res.status(400).json({ message: "No request pending" });
    }

    // ✅ Save the OLD DATA before changing anything
    const oldData = material.toObject(); // pura plain object bana lo
    delete oldData._id; // same id conflict avoid karne ke liye
    delete oldData.oldVersion; // nested recursion avoid karne ke liye
    oldData.status = "edit-approved";
    material.oldVersion = oldData; // old version set ho gaya

    // ✅ Now approve the new edit
    material.status = "edit-approved";
    material.reviewedBy = supervisorId;
    material.reviewedAt = new Date();

    await material.save();

    res.json({ message: "Edit request approved", material });
  } catch (error) {
    console.error("Approve Request Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.finalReviewDone = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findById(id);

    if (!material || material.status !== "done") {
      return res.status(400).json({ message: "Material not ready for final review" });
    }

    material.status = "final-done";
    await material.save();

    res.json({ message: "Final approval completed", material });
  } catch (error) {
    console.error("Final Review Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.ReviewDone = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findById(id);

    if (!material || material.status !== "done") {
      return res.status(400).json({ message: "Material not ready for final review" });
    }

    material.status = "review";
    await material.save();

    res.json({ message: "Final approval completed", material });
  } catch (error) {
    console.error("Final Review Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



exports.getAllMaterials = async (req, res) => {
  try {
    const userId = req.user.id; // Get logged-in user's ID

    const materials = await Material.find({ user: userId }) // Filter by user
      .populate("user", "name email role")
      .populate("material_Name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Materials fetched successfully",
      materials,
    });
  } catch (error) {
    console.error("Error fetching materials:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
exports.getfecthdonematerilaonly=async(req,res)=>{
  try {


    const materials = await Material.find({ status: "done" }) // Filter by user
      .populate("user", "name email role")
      .populate("material_Name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Materials fetched successfully",
      materials,
    });
  } catch (error) {
    console.error("Error fetching materials:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}
exports.getDoneMaterialsByAdmin = async (req, res) => {
  try {
    const adminId = req.user.id; // logged-in admin's ID

    // Filter materials where status = "done" AND createdByRole = "admin" OR createdBy adminId
    const materials = await Material.find({ 
        status: "done",
        createdByRole: "admin",
        // अगर आप चाहो कि सिर्फ particular admin की materials आएं
        // createdBy: adminId 
    })
    .populate("user", "name email role")
    .populate("material_Name")
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Materials fetched successfully for admin",
      materials,
    });
  } catch (error) {
    console.error("Error fetching materials:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



exports.getMaterialById = async (req, res) => {
  try {
    const materialId = req.params.id;
    let material = await Material.findById(materialId)
      .populate("user", "name role")
      .populate("material_Name")
      .lean();

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    if (material.status === "edit-approved" && material.oldVersion) {
      // ✅ merge oldVersion fields into the main material but keep original _id
      const { _id: oldVerId, ...oldVerWithoutId } = material.oldVersion;
      material = { ...material, ...oldVerWithoutId };
      delete material.oldVersion; // clean response
    } else {
      if (material.oldVersion) {
        delete material.oldVersion;
      }
    }

    res.status(200).json({
      success: true,
      message: "Material fetched successfully",
      material,
    });
  } catch (error) {
    console.error("Get Material By ID Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



exports.updateMaterialById = async (req, res) => {
  try {
    const materialId = req.params.id;
    const updatedMaterial = await Material.findByIdAndUpdate(materialId, req.body, { new: true });
    if (!updatedMaterial) {
      return res.status(404).json({ message: "Material not found" });
    }
    res.status(200).json({ message: "Material updated successfully", updatedMaterial });
  } catch (error) {
    console.error("Update Material Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteMaterialById = async (req, res) => {
  try {
    const materialId = req.params.id;
    const deletedMaterial = await Material.findByIdAndDelete(materialId);
    if (!deletedMaterial) {
      return res.status(404).json({ message: "Material not found" });
    }
    res.status(200).json({ message: "Material deleted successfully", deletedMaterial });
  } catch (error) {
    console.error("Delete Material Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.getMaterialsForSupervisor = async (req, res) => {
  try {
    let materials = await Material.find({
      status: { $in: ["done", "request-pending", "draft", "edit-approved","final-done"] }
    })
      .populate("user", "name role")
      .populate("material_Name")
      .sort({ createdAt: -1 })
      .lean();
materials = materials.map(material => {
  if (material.status === "edit-approved" && material.oldVersion) {
    const { _id: oldVerId, ...oldVerWithoutId } = material.oldVersion;
    // ✅ _id original material ka rakhein
    return { _id: material._id, ...oldVerWithoutId };
  } else {
    // ✅ Baaki cases me oldVersion hata do
    const { oldVersion, ...rest } = material;
    return rest;
  }
});


    res.status(200).json({
      success: true,
      message: "Materials for supervisor fetched",
      materials,
    });
  } catch (error) {
    console.error("Supervisor fetch error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
