const mongoose = require('mongoose');


const supportSchema = new mongoose.Schema({
    user_id: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true }
});

module.exports = mongoose.models.Support || mongoose.model('Support', supportSchema);