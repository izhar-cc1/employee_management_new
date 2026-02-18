const requireRole = (roles = []) => (req, res, next) => {
  const role = req.user?.role || "Employee";
  if (!roles.includes(role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
};

module.exports = requireRole;
