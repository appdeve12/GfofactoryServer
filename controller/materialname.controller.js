const Material = require("../modals/Material");

exports.getAllMaterials = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let filter = {};

    if (userRole !== "supervisior") {
      // If not supervisor, show only user's created materials
      filter.createdBy = userId;
    }

    const materials = await Material.find(filter)
      .populate("createdBy", "name email role _id");

    res.status(200).json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }
    res.status(200).json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.createMaterial = async (req, res) => {
      const userId = req.user.id;
  try {
    const material = new Material({
      name: req.body.name,
      description: req.body.description,
      type:req.body.type,
      createdBy:userId

    });

    const savedMaterial = await material.save();
    res.status(201).json(savedMaterial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    if (req.body.name != null) material.name = req.body.name;
    if (req.body.description != null) material.description = req.body.description;
       if (req.body.type != null) material.type = req.body.type;

    const updatedMaterial = await material.save();
    res.status(200).json(updatedMaterial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.updateMaterialLimit = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Check if the 'limit' field is provided in the request

    if (req.body.limit != null && req.body.limit_unit !=="") {
      material.limit = req.body.limit;
      material.limit_unit=req.body.limit_unit

    } else {
      return res.status(400).json({ message: "Limit is required to update" });
    }

    const updatedMaterial = await material.save();
    res.status(200).json(updatedMaterial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMaterial = async (req, res) => {
    console.log(req.params.id)
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    res.status(200).json({ message: "Material deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.toggleActiveInactivematerial = async (req, res) => {
  try {
    const { materialId } = req.params; // The ID of the admin to block/unblock
    const { action } = req.body; // Either 'block' or 'unblock'



    // Find the admin to block/unblock
    const material = await Material.findById(materialId);
  

    // Toggle the block status based on the action
    if (action === "active") {
      material.isActive = true;
    } else if (action === "inactive") {
      material.isActive = false;
    } else {
      return res.status(400).json({ message: "Invalid action. Use 'active' or 'inactive'" });
    }

    await material.save();
    res.status(200).json({
      message: `materail has been ${action}ed successfully`,
     material
    });
  } catch (error) {
    console.error("active/active Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};