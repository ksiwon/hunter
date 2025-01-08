const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    User_ID: { type: String, required: true, unique: true },
    User_NICKNAME: { type: String, required: true },
});

module.exports = mongoose.model('User', UserSchema);
