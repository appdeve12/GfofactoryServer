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
    } = req.body;

    // Validate material
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ success: false, message: "Material not found" });
    }

    // Create new order
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
      remarks,
      orderSaved: false,  // initial flags false
      emailSent: false,
    });

    // Save order
    await order.save();

    // Prepare email HTML
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
        </tr>
        <tr>
          <td>${materialName}</td>
          <td>${materialType}</td>
          <td>${quantity}</td>
          <td>${cost}</td>
          <td>${gstNumber}</td>
          <td>${billingAddress}</td>
          <td>${shippingAddress}</td>
          <td>${remarks}</td>
        </tr>
      </table>
    `;

    // Send email
    await sendEmail({
      to: supplierEmail,
      subject: `New Order for ${materialName}`,
      html: emailHtml,
    });

    // Update order flags and save again
    order.orderSaved = true;
    order.emailSent = true;
    await order.save();

    res.json({ success: true, message: "Order placed and email sent", order });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getOrdersByMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;

    if (!materialId) {
      return res.status(400).json({ success: false, message: "MaterialId is required" });
    }

    // Fetch orders by material id, sorted newest first
    const orders = await Order.find({ material: materialId }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: orders,
    });
  } catch (err) {
    console.error("Error fetching orders by material:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
