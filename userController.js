const User = require('../models/User');

exports.getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = (({ name, bio, avatar }) => ({ name, bio, avatar }))(req.body);
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

exports.follow = async (req, res, next) => {
  try {
    const targetUsername = req.params.username;
    if (req.user.username === targetUsername) return res.status(400).json({ success: false, message: "You can't follow yourself" });
    const target = await User.findOne({ username: targetUsername });
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    const alreadyFollowing = target.followers.includes(req.user._id);
    if (alreadyFollowing) {
      // unfollow
      target.followers.pull(req.user._id);
      req.user.following.pull(target._id);
      await target.save();
      await req.user.save();
      return res.json({ success: true, message: 'Unfollowed', following: false });
    }
    target.followers.push(req.user._id);
    req.user.following.push(target._id);
    await target.save();
    await req.user.save();
    res.json({ success: true, message: 'Followed', following: true });
  } catch (err) { next(err); }
};
