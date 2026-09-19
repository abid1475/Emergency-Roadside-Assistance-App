import jwt from "jsonwebtoken";

// =====================================================
// PROTECT MIDDLEWARE
// =====================================================

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // No token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded JWT:", decoded);

    // Add decoded user information to request
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// =====================================================
// ADMIN ONLY MIDDLEWARE
// =====================================================

export const adminOnly = (req, res, next) => {
  try {
    // Check if user information exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login first.",
      });
    }

    // Check user's role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    // User is admin
    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error.message);

    return res.status(403).json({
      success: false,
      message: "Access denied.",
    });
  }
};
