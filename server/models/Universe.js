const mongoose = require('mongoose');

const UniverseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {   // <-- Bu alanın olduğundan emin ol
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Universe', UniverseSchema);