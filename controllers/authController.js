// This file contains the authentication controller functions for user signup and signin.

const model = require('../model');
const { generateToken } = require('../utils/jwt');
require('dotenv').config();

async function signUp(req, res) {
  try {
    const { email, mobile, name, password } = req.body;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    // Mobile number validation (Indian 10-digit number, starting with 6-9)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobile || !mobileRegex.test(mobile)) {
      return res.status(400).json({ error: 'Invalid Indian mobile number.' });
    }

    // Name validation (not empty, reasonable length)
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters long.' });
    }

    // Password validation (at least 6 characters)
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Proceed with registration
    const userId = await model.registerUser({ email, mobile, name, password });

    return res.status(201).json({
      message: 'Signup successful. Please sign in.',
      redirect: '/signin',
    });
  } catch (error) {
    if (error.message && error.message.includes('A user with that email or mobile already exists.')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error during signup:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}


async function signIn(req, res) {
  try {
    const { email, password } = req.body;
    const user = await model.findUserByCredentials(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please try again or sign up.' });
    }
    const token = generateToken({ userId: user.id, email: user.email }, '24h');
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    return res.status(200).json({
      message: 'Login successful!',
      redirect: '/user/dashboard',
    });
  } catch (error) {
    console.error('Sign-in error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function logout (req, res) {
  console.log('Logging out user ID:', req.user?.userId || 'Unknown');

  // Clear the token cookie (same name and options as used in res.cookie)
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return res.status(200).json({ message: 'Logged out successfully.' });
};

module.exports = {
  signUp,
  signIn,
  logout
};
