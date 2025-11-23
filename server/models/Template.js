const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['character', 'location', 'lore'] // Hangi tür için bu şablon?
    },
    // Bu şablon seçilince otomatik gelecek özellik isimleri
    // Örn: [{ key: "Güç", value: "10" }, { key: "Zeka", value: "10" }]
    attributes: [{
        key: { type: String, required: true },
        value: { type: String, default: '' }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Template', TemplateSchema);