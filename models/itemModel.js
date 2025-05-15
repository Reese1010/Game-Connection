const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true, 
    },
    condition: {
        type: String,
        required: true,
        enum: ['new', 'like new', 'used', 'refurbished'], 
    },
    price: {
        type: Number,
        required: true,
        min: 0.01, 
    },
    details: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: true, 
    },
    offers: {
        type: Number,
        default: 0, 
    },
    totalOffers: {
        type: Number,
        default: 0, 
    },
    highestOffer: {
        type: Number,
        default: 0, 
    }
});
itemSchema.statics.get = async function (id) {
    return this.findById(id).populate('seller', 'firstName lastName email'); 
};

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
