const express = require('express');
const router = express.Router();
const Merchandise = require('../models/Merchandise');

// 모든 상품 조회
router.get('/', async (req, res) => {
    try {
        const merchandises = await Merchandise.find();
        res.status(200).json(merchandises);
    } catch (error) {
        console.error('Failed to fetch merchandises:', error);
        res.status(500).json({ message: 'Failed to fetch merchandises' });
    }
});

// 상품 추가
router.post('/', async (req, res) => {
    try {
        const newMerchandise = new Merchandise(req.body);
        await newMerchandise.save();
        res.status(201).json(newMerchandise);
    } catch (error) {
        console.error('Failed to add merchandise:', error);
        res.status(500).json({ message: 'Failed to add merchandise' });
    }
});

module.exports = router;
