const jwt = require("jsonwebtoken");

module.exports = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ msg: "Access denied, no token" });

      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;

      // Check role if roles are defined
      if (roles.length && !roles.includes(verified.role)) {
        return res.status(403).json({ msg: "Unauthorized Access" });
      }

      next();
    } catch (error) {
      res.status(401).json({ msg: "Invalid Token" });
    }
  };
};
