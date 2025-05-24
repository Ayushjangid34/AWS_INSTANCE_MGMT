const { verifyToken } = require('../utils/jwt');


// This middleware function checks whether the user is authenticated or not if yes then redirects to the dashboard from public pages
function isAuthenticated(req, res, next) {
  const token = req.cookies.token;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      // If the token is valid, redirect to the dashboard
      console.log('User is authenticated:', decoded);
      return res.redirect('/user/dashboard');
    }
  }
  // If no token or invalid token, proceed to the next route handler
  next();
}

module.exports = isAuthenticated;
