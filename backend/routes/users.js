const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 모든 사용자 조회
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// 사용자 추가
router.post('/', async (req, res) => {
    try {
        const { User_ID, User_NICKNAME } = req.body;
        if (!User_ID || !User_NICKNAME) {
            return res.status(400).json({ message: 'User_ID or User_NICKNAME is missing' });
        }
        const user = new User({ User_ID, User_NICKNAME });
        await user.save();
        res.status(201).json({ message: 'User added successfully' });
    } catch (error) {
        console.error('Failed to add user:', error);
        res.status(500).json({ message: 'Failed to add user' });
    }
});

module.exports = router;
