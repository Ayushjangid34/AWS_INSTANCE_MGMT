const path = require('path');

exports.getHomePage = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/public/home.html')); // Serves the home page
};
exports.getSignInPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/public/login.html')); // Serves the sign-in page
};
exports.getSignUpPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/public/signup.html')); // Serves the sign-up page
};