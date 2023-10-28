const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');

router.post("/register", registerController.createNewUser);
router.post('/confirm-account', registerController.ConfirmUser);

module.exports = router;