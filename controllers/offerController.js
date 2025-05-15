const Offer = require('../models/offerModel');
const Item = require('../models/itemModel');

const makeOffer = async (req, res, next) => {
  try {
      const item = await Item.findById(req.params.itemId);
      if (!item) {
          const error = new Error('Item not found');
          error.status = 404;
          return next(error);
      }
      const offer = new Offer({
          user: req.session.user._id,
          item: item._id,
          amount: req.body.amount,
      });
      await offer.save();
      item.offers += 1;
      await item.save();

      req.flash('success', 'Offer made successfully');
      res.redirect(`/items/${item._id}`);
  } catch (err) {
      next(err);
  }
};

  const viewOffers = async (req, res) => {
    try {
        const item = await Item.findById(req.params.itemId).populate('seller');
        if (!item) {
            return res.status(404).render('error', { message: 'Item not found' });
        }

        const offers = await Offer.find({ item: req.params.itemId });
        res.render('offers/view', { item, offers });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Server error' });
    }
};
const acceptOffer = async (req, res) => {
  const { itemId, offerId } = req.params;
  const userId = req.session.user._id;

  try {
    const item = await Item.findById(itemId);
    if (!item || item.seller.toString() !== userId.toString()) {
      return res.status(401).render('error', { message: 'Unauthorized to accept offers for this item' });
    }

    const offer = await Offer.findById(offerId);
    if (!offer || offer.status !== 'pending') {
      return res.status(400).render('error', { message: 'Offer not available or already accepted/rejected' });
    }

    offer.status = 'accepted';
    await offer.save();
    await Offer.updateMany({ item: itemId, status: 'pending' }, { status: 'rejected' });
    item.active = false;
    await item.save();

    res.redirect(`/items/${itemId}`);
  } catch (err) {
    res.status(500).render('error', { message: 'Error accepting offer' });
  }
};

const getUserProfile = async (req, res) => {
    const userId = req.session.user._id;
  
    try {
      const items = await Item.find({ seller: userId });
      const offers = await Offer.find({ user: userId }).populate('item');
      
      res.render('user/profile', { items, offers });
    } catch (err) {
      res.status(500).render('error', { message: 'Error fetching profile data' });
    }
  };

module.exports = { makeOffer, viewOffers, acceptOffer, getUserProfile };
