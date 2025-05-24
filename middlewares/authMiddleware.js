const { verifyToken } = require('../utils/jwt');

// This middleware function checks if the user is authenticated by verifying the JWT token if not then redirects to the sign-in page
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect('/signin');
  const decoded = verifyToken(token);
  if (!decoded) return res.redirect('/signin');
  req.user = decoded;
  next();
}

module.exports = authenticateToken;
