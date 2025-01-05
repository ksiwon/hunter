const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            reqiured: true,
        },
        email: {
            type: String,
        },
        phone: {
            type: String,
            required: [true, "전화번호는 꼭 기입해주세요."],
        },
    },
    {
        timestamps: true,
    }
);

const Contact = mongoose.model("Contact", contactSchema);
module.exports = Contact;