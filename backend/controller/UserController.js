const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Sign Up
exports.signUp = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    // Check if fullName (username) or email already exists
    let user = await User.findOne({ $or: [{ fullName }, { email }] });
    if (user) {
      if (user.fullName === fullName) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      if (user.email === email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ fullName, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Account created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// User Sign In
exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, fullName: user.fullName, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(200).json({
      token,
      user: { id: user._id, email: user.email, fullName: user.fullName, role: 'user' },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin Sign In
exports.adminSignIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(200).json({
      token,
      admin: { id: admin._id, email: admin.email, role: 'admin' },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
