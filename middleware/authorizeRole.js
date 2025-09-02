// middleware/authorizeRole.js

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Extract user role from req.user
    const userRole = req.user?.role;

    // Log the user role for debugging (remove in production)
    console.log("User Role:", userRole);

    // If the role doesn't exist in the token, deny access
    if (!userRole) {
      return res.status(403).json({ message: "Role not found in token" });
    }

 

    // Proceed to the next middleware/route handler if the role is valid
    next();
  };
};

module.exports = authorizeRole;
