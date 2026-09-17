/**
 * Role-based access control middleware.
 * Must be used AFTER authMiddleware (req.user must be populated).
 *
 * @param {...string} roles - Allowed roles, e.g. requireRole('admin', 'ngo')
 */
export default function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied — required role: ${roles.join(' or ')}` });
    }
    next();
  };
}
