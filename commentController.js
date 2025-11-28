const Comment = require('../models/Comment');
const Post = require('../models/Post');

exports.addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { body } = req.body;
    if (!body) return res.status(400).json({ success: false, message: 'Comment body required' });
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const comment = await Comment.create({ post: post._id, author: req.user._id, body });
    res.status(201).json({ success: true, comment });
  } catch (err) { next(err); }
};

exports.getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId }).populate('author', 'username name avatar').sort({ createdAt: 1 });
    res.json({ success: true, count: comments.length, comments });
  } catch (err) { next(err); }
};

exports.updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body } = req.body;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (!comment.author.equals(req.user._id)) return res.status(403).json({ success: false, message: 'Not allowed' });
    comment.body = body || comment.body;
    await comment.save();
    res.json({ success: true, comment });
  } catch (err) { next(err); }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (!comment.author.equals(req.user._id)) return res.status(403).json({ success: false, message: 'Not allowed' });
    await comment.remove();
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) { next(err); }
};
