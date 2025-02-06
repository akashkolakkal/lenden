const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config/config');

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: 'User registered', user });
  } catch (error) {
    res.status(400).json({ message: 'Error registering user', error });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

    res.cookie('authToken', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'None', 
    });

    res.json({ message: 'Logged in' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error logging in', error });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, password, newPassword } = req.body;
    const userId = req.user.id;  
    
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optionally, update the username if provided
    if (username) {
      user.username = username;
    }

    // Update password if a new one is provided
    if (newPassword) {
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;
    }

    await user.save();
    
    res.status(200).json({ message: 'Profile updated', user });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error updating profile', error });
  }
};