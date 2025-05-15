const express = require('express');
const router = express.Router();
const controller = require('../controllers/itemController');
const {isLoggedIn, isSeller} = require('../middlewares/auth');
const{validateId, validateItem, validateResult} = require('../middlewares/validator');
const { upload } = require('../controllers/itemController');

router.get('/', controller.index);
router.get('/new', isLoggedIn, controller.new);
router.post('/', isLoggedIn, upload.single('image'), validateItem, validateResult, controller.create); 
router.get('/:id', validateId, controller.show);
router.get('/:id/edit', validateId, isLoggedIn, isSeller, controller.edit);
router.put('/:id', validateId, isLoggedIn, isSeller, validateItem, validateResult, controller.update);
router.delete('/:id', validateId, isLoggedIn, isSeller, controller.destroy);

module.exports = router;


