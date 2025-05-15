const express = require('express');
const router = express.Router();
const controller = require('../controllers/offerController');
const { isLoggedIn, isSeller } = require('../middlewares/auth');
const { viewOffers } = require('../controllers/offerController');


// Make an offer on an item
router.post('/:itemId', isLoggedIn, controller.makeOffer);
// View all offers on an item 
router.get('/:itemId', isLoggedIn, isSeller, viewOffers);
// Accept an offer
router.put('/:itemId/:offerId/accept', isLoggedIn, controller.acceptOffer);

router.get('/profile', isLoggedIn, controller.getUserProfile);

module.exports = router;
