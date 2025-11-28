const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/:username', userController.getProfile);
router.put('/', protect, userController.updateProfile);
router.post('/:username/follow', protect, userController.follow);

module.exports = router;
