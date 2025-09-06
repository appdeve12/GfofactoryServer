const Order = require("../modals/OrderSchema.route");
const Material = require("../modals/Material");
const sendEmail = require("../utils/sendEmail");

exports.placeOrder = async (req, res) => {
  try {
    const {
      materialId,
      quantity,
      cost,
      gstNumber,
      remarks,
      supplierName,
      supplierEmail,
      supplierPhone,
      billingAddress,
      shippingAddress,
      materialName,
      materialType,
      quantity_unit,
      contactperson,
      companyname
    } = req.body;

    // ✅ Validate material existence
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ success: false, message: "Material not found" });
    }

    // ✅ Create new order instance
    const order = new Order({
      material: materialId,
      materialName,
      materialType,
      supplierName,
      supplierEmail,
      supplierPhone,
      billingAddress,
      shippingAddress,
      quantity,
      cost,
      gstNumber,
      quantity_unit,
      remarks,
         contactperson,
      companyname,
      orderSaved: false,
      emailSent: false,
    });

    // ✅ Save the order first
    await order.save();

    // ✅ Prepare email content
    const emailHtml = `
      <h3>New Order Placed</h3>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
        <tr>
          <th>Material Name</th>
          <th>Material Type</th>
          <th>Quantity</th>
          <th>Cost</th>
          <th>GST Number</th>
          <th>Billing Address</th>
          <th>Shipping Address</th>
          <th>Remarks</th>
          <th> contactperson,
      </th>
          <th>companyname</th>
        </tr>
        <tr>
          <td>${materialName}</td>
          <td>${materialType}</td>
          <td>${quantity}${quantity_unit}</td>
          <td>${cost}</td>
          <td>${gstNumber}</td>
          <td>${billingAddress}</td>
          <td>${shippingAddress}</td>
          <td>${remarks}</td>
          <td>${contactperson}</td>
       <td> ${companyname}</td>
        </tr>
      </table>
    `;

    // ✅ Send order email to supplier
    await sendEmail({
      to: supplierEmail,
      subject: `New Order for ${materialName}`,
      html: emailHtml,
    });

    // ✅ Update order flags
    order.orderSaved = true;
    order.emailSent = true;
    await order.save();

    // ✅ Mark material as ordered
    await Material.findByIdAndUpdate(materialId, { isOrdered: true });

    // ✅ Final response
    res.json({ success: true, message: "Order placed and email sent successfully", order });

  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ success: false, message: "Server error while placing order" });
  }
};
exports.getOrdersByMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;

    // Check if the material exists
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ success: false, message: "Material not found" });
    }

    // Find all orders for that material
    const orders = await Order.find({ material: materialId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      material: {
        id: material._id,
        name: material.name,
        type: material.type,
      },
      totalOrders: orders.length,
      orders,
    });

  } catch (error) {
    console.error("Error fetching orders for material:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.getOrdersByMyMaterials = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let materialFilter = {};

    // 🔐 Supervisior can see all; others only their materials
    if (userRole !== "supervisior") {
      materialFilter.createdBy = userId;
    }

    // Step 1: Get materials created by user
    const materials = await Material.find(materialFilter).select("_id");
    const materialIds = materials.map((m) => m._id);

    if (materialIds.length === 0) {
      return res.status(200).json({
        success: true,
        totalOrders: 0,
        orders: [],
      });
    }

    // Step 2: Get orders linked to those materials
    const orders = await Order.find({ material: { $in: materialIds } })
      .sort({ createdAt: -1 })
      .populate({
        path: "material",
        select: "name type createdBy",
        populate: {
          path: "createdBy",
          select: "name email role",
        },
      });

    res.status(200).json({
      success: true,
      totalOrders: orders.length,
      orders,
    });

  } catch (error) {
    console.error("Error fetching orders by my materials:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
