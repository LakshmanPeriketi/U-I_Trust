import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Verifies the Bearer JWT and attaches `req.user` (lean User document).
 * Rejects with 401 if token is missing or invalid.
 */
export default async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token   = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-passwordHash').lean();
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
