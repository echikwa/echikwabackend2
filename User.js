const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, validate: [validator.isEmail, 'Invalid email'] },
  password: { type: String, required: true, minlength: 6, select: false },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.createPasswordResetToken = function (minutes) {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = Date.now() + minutes * 60 * 1000; // minutes
  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
