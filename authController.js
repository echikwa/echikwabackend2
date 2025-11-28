const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendResetEmail } = require('../utils/emailMock');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

exports.register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) return res.status(400).json({ success: false, message: 'Please provide name, username, email and password' });
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ success: false, message: 'Email or username already in use' });
    const user = await User.create({ name, username, email, password });
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, username: user.username, email: user.email } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) return res.status(400).json({ success: false, message: 'Please provide credentials' });
    const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] }).select('+password');
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const token = signToken(user._id);
    user.password = undefined;
    res.json({ success: true, token, user });
  } catch (err) { next(err); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Provide email' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No user with that email' });
    const minutes = parseInt(process.env.RESET_PASSWORD_EXPIRES_MIN || '30', 10);
    const resetToken = user.createPasswordResetToken(minutes);
    await user.save({ validateBeforeSave: false });
    const resetURL = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    await sendResetEmail({ to: user.email, subject: 'Password reset', text: `Reset your password: ${resetURL}` });
    res.json({ success: true, message: 'Reset token sent to email (mock)' });
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, message: 'Invalid request' });
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Token invalid or expired' });
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    const jwtToken = signToken(user._id);
    res.json({ success: true, token: jwtToken, message: 'Password reset successful' });
  } catch (err) { next(err); }
};
