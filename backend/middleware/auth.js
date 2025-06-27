const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from the Authorization header (standard for Bearer tokens)
  const authHeader = req.header('Authorization');

  // Check if Authorization header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Extract the token string by removing 'Bearer ' prefix
  const token = authHeader.split(' ')[1];

  // If for some reason the token is empty after splitting
  if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Attach user info (ID) to the request
    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    // console.error(err.message); // For debugging
    res.status(401).json({ msg: 'Token is not valid' }); // Token invalid
  }
};