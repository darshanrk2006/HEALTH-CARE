import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const JWT_SECRET = process.env.JWT_SECRET || 'titanvitals_super_secret_jwt_key_2026_nxtgen';

export const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: Admin authorization token required.'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify token specifically has role 'admin' or matches Admin document
    if (!decoded.isAdmin && !decoded.role?.includes('Admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Regular user accounts cannot access Admin APIs.'
      });
    }

    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin Session: Administrator record not found.'
      });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Admin Authentication failed: Invalid or expired token.'
    });
  }
};
