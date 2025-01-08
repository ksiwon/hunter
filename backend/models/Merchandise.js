const mongoose = require('mongoose');

const MerchandiseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: String, required: true },
    condition: { type: String, required: true },
    description: { type: String, required: true },
    sellerName: { type: String, required: true },
    imageSrc: { type: [String], required: true },
    status: { type: String, required: true, default: 'available' },
    deals: { type: Array, default: [] },
    date: { type: String, required: true },
});

module.exports = mongoose.model('Merchandise', MerchandiseSchema);
