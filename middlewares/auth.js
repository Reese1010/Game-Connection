const Item = require('../models/itemModel');

exports.isGuest = (req, res, next) => {
    if (!req.session.user) {
        return next(); 
    } else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/users/profile'); 
    }
};

exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return next(); 
    } else {
        req.flash('error', 'You need to log in first');
        return res.redirect('/users/login'); 
    }
};

exports.isSeller = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item || item.seller.toString() !== req.session.user._id.toString()) {
            return res.status(401).render('error', { message: 'Unauthorized to delete this item' });
        }
        next();
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Server error' });
    }
};
