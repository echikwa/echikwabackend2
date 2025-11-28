const Post = require('../models/Post');
const slugify = require('slugify');

exports.createPost = async (req, res, next) => {
  try {
    const { title, body, tags } = req.body;
    if (!title || !body) return res.status(400).json({ success: false, message: 'Title and body required' });
    let slug = slugify(title, { lower: true, strict: true });
    // ensure unique slug
    let exists = await Post.findOne({ slug });
    let i = 1;
    while (exists) {
      slug = `${slug}-${i++}`;
      exists = await Post.findOne({ slug });
    }
    const post = await Post.create({ author: req.user._id, title, body, tags: tags || [], slug });
    res.status(201).json({ success: true, post });
  } catch (err) { next(err); }
};

exports.getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, tag, author, q } = req.query;
    const filter = {};
    if (tag) filter.tags = tag;
    if (author) filter.author = author;
    if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { body: new RegExp(q, 'i') }];
    const posts = await Post.find(filter)
      .populate('author', 'username name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Post.countDocuments(filter);
    res.json({ success: true, count: posts.length, total, posts });
  } catch (err) { next(err); }
};

exports.getPost = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    const post = await Post.findOne({ $or: [{ slug: slugOrId }, { _id: slugOrId }] }).populate('author', 'username name avatar');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) { next(err); }
};

exports.updatePost = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    const post = await Post.findOne({ $or: [{ slug: slugOrId }, { _id: slugOrId }] });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (!post.author.equals(req.user._id)) return res.status(403).json({ success: false, message: 'Not allowed' });
    const { title, body, tags } = req.body;
    if (title) post.title = title;
    if (body) post.body = body;
    if (Array.isArray(tags)) post.tags = tags;
    await post.save();
    res.json({ success: true, post });
  } catch (err) { next(err); }
};

exports.deletePost = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    const post = await Post.findOne({ $or: [{ slug: slugOrId }, { _id: slugOrId }] });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (!post.author.equals(req.user._id)) return res.status(403).json({ success: false, message: 'Not allowed' });
    await post.remove();
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) { next(err); }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    const post = await Post.findOne({ $or: [{ slug: slugOrId }, { _id: slugOrId }] });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const already = post.likes.includes(req.user._id);
    if (already) {
      post.likes.pull(req.user._id);
      await post.save();
      return res.json({ success: true, liked: false });
    }
    post.likes.push(req.user._id);
    await post.save();
    res.json({ success: true, liked: true });
  } catch (err) { next(err); }
};
