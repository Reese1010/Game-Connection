const model = require('../models/user');
const Item = require('../models/itemModel');
const Offer = require('../models/offerModel');


exports.new = (req, res) => {
    return res.render('users/new'); 
};

exports.create = (req, res, next) => {
    let user = new model(req.body);
    if (user.email) user.email = user.email.toLowerCase();
    user.save()
    .then(user => {
        req.flash('success', 'Registration succeeded!');
        req.session.save(() => res.redirect('/users/login'));
    })
    .catch(err => {
        if (err.name === 'ValidationError') {
            req.flash('error', err.message);
            req.session.save(() => res.redirect('back'));
        }
        if (err.code === 11000) {
            req.flash('error', 'Email has been used');
            req.session.save(() => res.redirect('back'));
        }
        next(err);
    });
};

exports.getUserLogin = (req, res, next) => {
    return res.render('users/login'); 
};

exports.login = (req, res, next) => {
    let email = req.body.email;
    if (email) email = email.toLowerCase();
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', 'Wrong email address');
            req.session.save(() => res.redirect('/users/login'));
        } else {
            user.comparePassword(password)
            .then(result => {
                if (result) {
                    req.session.user = user;
                    req.flash('success', 'You have successfully logged in');
                    req.session.save(() => res.redirect('/users/profile'));
                } else {
                    req.flash('error', 'Wrong password');
                    req.session.save(() => res.redirect('/users/login'));
                }
            });
        }
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next) => {
    let id = req.session.user._id;  
    Promise.all([
        model.findById(id),           
        Item.find({ seller: id }), 
        Offer.find({ user: id }).populate('item') 
    ])
    .then(results => {
        const [user, items, offers] = results; 
        res.render('users/profile', { user, items, offers }); 
    })
    .catch(err => next(err));
};

exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) return next(err);
        else res.redirect('/');
    });
};

