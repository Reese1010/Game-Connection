const multer = require('multer');
const ItemModel = require('../models/itemModel');
const Offer = require('../models/offerModel');
const path = require('path');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
const index = async (req, res) => {
    try {
        let items = await ItemModel.find({}).populate('seller'); 

        let filteredItems = items.filter(item => item.active);

        if (req.query.search) {
            const searchTerm = req.query.search.toLowerCase();
            filteredItems = filteredItems.filter(item =>
                item.title.toLowerCase().includes(searchTerm) ||
                item.details.toLowerCase().includes(searchTerm) ||
                (item.seller && (item.seller.firstName.toLowerCase().includes(searchTerm) || item.seller.lastName.toLowerCase().includes(searchTerm)))
            );
        }

        filteredItems.sort((a, b) => a.price - b.price);
        const foundItems = filteredItems.length > 0;
        res.render('items', { items: filteredItems, foundItems });
    } catch (err) {
        console.error('Error fetching items:', err);
        res.status(500).render('error', { message: 'Error fetching items' });
    }
};


const newItem = (req, res) =>{
    res.render('new');
};
const create = async (req, res) =>{
    try{
        if (!req.file){
            return res.status(400).render('error', { message: 'Image upload failed' });
        }

        const newItemData = {
            title: req.body.title,
            condition: req.body.condition,
            price: parseFloat(req.body.price),
            seller: req.session.user._id,
            details: req.body.details,
            image: `/images/${req.file.filename}`, 
        };
        await ItemModel.create(newItemData); 
        res.redirect('/items');
    } catch (err){
        console.error(err); 
        res.status(500).render('error', { message: 'Error creating item' });
    }
};
const show = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await ItemModel.findById(itemId).populate('seller');

        if (!item) {
            return res.status(404).render('error', { message: 'Item not found' });
        }

        res.render('itemDetail', { item });
    } catch (err) {
        console.error('Error fetching item:', err);
        res.status(500).render('error', { message: 'Error fetching item' });
    }
};

const edit = async (req, res) => {
    try {
        const item = await ItemModel.findById(req.params.id).populate('seller'); 

        if (!item) {
            return res.render('error', { message: `404 - No item with id ${req.params.id}` });
        }

        if (item.seller.toString() !== req.session.user._id.toString()) {
            return res.status(401).render('error', { message: 'Unauthorized to edit this item' });
        }

        res.render('edit', { item });
    } catch (err) {
        res.status(500).render('error', { message: 'Error fetching item' });
    }
};


const update = async (req, res) => {
    const itemId = req.params.id;
    try {
        const existingItem = await ItemModel.get(itemId);
        if (!existingItem) {
            return res.status(404).render('error', { message: `404 - No item with id ${itemId}` });
        }
        if (existingItem.seller.toString() !== req.session.user._id.toString()) {
            return res.status(401).render('error', { message: 'Unauthorized to update this item' });
        }

        const itemData = {
            title: req.body.title,
            condition: req.body.condition,
            price: parseFloat(req.body.price) || 0,
            seller: req.body.seller,  
            details: req.body.details,
            image: req.file ? `/images/${req.file.filename}` : existingItem.image
        };

        await ItemModel.update(itemId, itemData);
        res.redirect(`/items/${itemId}`);
    } catch (err) {
        res.status(500).render('error', { message: 'Error updating item' });
    }
};

const destroy = async (req, res) => {
    try {
      const item = await ItemModel.get(req.params.id);
      if (!item) {
        return res.status(404).render('error', { message: `404 - No item with id ${req.params.id}` });
      }
      if (item.seller.toString() !== req.session.user._id.toString()) {
        return res.status(401).render('error', { message: 'Unauthorized to delete this item' });
      }
      await Offer.deleteMany({ item: req.params.id });
  
      await ItemModel.delete(req.params.id);
  
      res.redirect('/items');
    } catch (err) {
      res.status(500).render('error', { message: 'Error deleting item' });
    }
  };
  

module.exports = {
    index,
    new: newItem,
    create,
    show,
    edit,
    update,
    destroy,
    upload
};