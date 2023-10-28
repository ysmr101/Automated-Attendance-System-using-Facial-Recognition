const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/forgetPasswordController');

router.post('/userId', passwordController.sendCode);
router.post('/confirmationCode', passwordController.confirmUser);

module.exports = router;