const Material = require("../modals/MaterialStock");

exports.createMaterialEntry = async (req, res) => {
  try {
    console.log("he;p")
    const userId = req.user.id;
    console.log("userId",userId)
    const { material_Name, purchase_quantity, purchase_date, supplier, file, remarks } = req.body;

    // Optional: check if material with same name and date exists (if needed)
    const alreadyExists = await Material.findOne({ material_Name, purchase_date });
    if (alreadyExists) return res.status(400).json({ message: "Material already exists for this date" });

    const material = new Material({
      material_Name,
      purchase_quantity,
      purchase_date,
      supplier,
      file,
      remarks,
      user: userId,
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
exports.getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find()
      .populate("user", "name email role").populate("material_Name")
      .sort({ createdAt: -1 }); // Optional: Sort by latest first

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


exports.getMaterialById = async (req, res) => {
  try {
    const materialId = req.params.id;
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }
    res.status(200).json({ message: "Material fetched successfully", material });
  } catch (error) {
    console.error("Get Material By ID Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
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
