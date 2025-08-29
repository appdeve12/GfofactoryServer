const Material = require("../modals/Material");


exports.getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find();
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
  try {
    const material = new Material({
      name: req.body.name,
      description: req.body.description,
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
