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
    if (!material) return res.status(404).json({ success: false, message: "Material not found" });

    // Save order
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
    });

    await order.save();

    // Send Email
    const emailHtml = `
      <h3>New Order Placed</h3>
      <table border="1" cellpadding="8" cellspacing="0">
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

    await sendEmail({
      to: supplierEmail,
      subject: `New Order for ${materialName}`,
      html: emailHtml,
    });
    order.orderSaved = true;
    order.emailSent = true;

    res.json({ success: true, message: "Order placed and email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getOrdersByMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;

    const orders = await Order.find({ material: materialId })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: orders
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
