const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log('Auth header received:', authHeader);
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error('Token verify error:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};