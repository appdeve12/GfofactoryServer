const User = require("../modals/User.modal");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser._id, name, email, role },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if the user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account is blocked. Please contact support." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "40d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role ,user},
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.viewAllAdminUsers = async (req, res) => {
  try {
    const allAdmins = await User.find({ role: "admin" });

    res.status(200).json({
      message: "All admin data fetched successfully",
      admins: allAdmins,
    });
  } catch (error) {
    console.error("Fetch Admin Data Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.toggleBlockAdmin = async (req, res) => {
  try {
    const { adminId } = req.params; // The ID of the admin to block/unblock
    const { action } = req.body; // Either 'block' or 'unblock'



    // Find the admin to block/unblock
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Toggle the block status based on the action
    if (action === "block") {
      admin.isBlocked = true;
    } else if (action === "unblock") {
      admin.isBlocked = false;
    } else {
      return res.status(400).json({ message: "Invalid action. Use 'block' or 'unblock'" });
    }

    await admin.save();
    res.status(200).json({
      message: `Admin has been ${action}ed successfully`,
      admin: { id: admin._id, name: admin.name, email: admin.email, isBlocked: admin.isBlocked },
    });
  } catch (error) {
    console.error("Block/Unblock Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.resetAdminPassword = async (req, res) => {
  try {
    const { adminId, newPassword } = req.body;

    // Find supervisor (assuming req.user contains the logged-in supervisor's data)
    const supervisor = await User.findById(req.user.id);
   
    // Find the admin user whose password needs to be reset
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin user not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the admin's password
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({
      message: "Admin password has been reset successfully",
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }  
};
exports.adminUpdateAndManagePermission = async (req, res) => {
  try {
    const { adminId, permissions } = req.body;



    // check admin exists
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    // update permissions
    admin.permissions = { ...admin.permissions.toObject(), ...permissions };
    await admin.save();

    res.status(200).json({
      message: "Admin permissions updated successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    console.error("Error updating admin permissions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.checkuserblockedornot=async(req,res)=>{
  try{
const userID=req.user.id;
const finduserblockedstatus=await User.findById(userID);
if(finduserblockedstatus.isBlocked===true){
  return res.status(200).json({
    message:"this user is blocked",
    blocked:true
  })
}
  }catch(error){
    console.error("checked blocked user");
    res.status(500).json({message:"Internal Server error"})
  }
}