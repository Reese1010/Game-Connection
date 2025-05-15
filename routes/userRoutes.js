const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

router.get('/new', userController.new);

router.post('/', userController.create);

router.get('/login', userController.getUserLogin);

router.post('/login', userController.login);

router.get('/profile', auth.isLoggedIn, userController.profile);

router.get('/logout', userController.logout);

module.exports = router;




