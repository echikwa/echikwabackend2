const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/auth');

router.get('/', postController.getPosts);
router.post('/', protect, postController.createPost);
router.get('/:slugOrId', postController.getPost);
router.put('/:slugOrId', protect, postController.updatePost);
router.delete('/:slugOrId', protect, postController.deletePost);
router.post('/:slugOrId/like', protect, postController.toggleLike);

module.exports = router;
