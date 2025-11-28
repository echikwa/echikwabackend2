const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/post/:postId', commentController.getComments);
router.post('/post/:postId', protect, commentController.addComment);
router.put('/:id', protect, commentController.updateComment);
router.delete('/:id', protect, commentController.deleteComment);

module.exports = router;
