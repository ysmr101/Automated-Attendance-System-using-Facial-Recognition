const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/', loginController.handleLogin);
router.post('/Device', loginController.handleDeviceLogin);

module.exports = router;