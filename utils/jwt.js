// utility functions for generating and verifying JWT tokens used in the application middlewares

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.SECRET_KEY;


function generateToken(payload, expiresIn = '1h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { generateToken, verifyToken };
