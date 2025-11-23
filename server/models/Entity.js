const mongoose = require('mongoose');

const EntitySchema = new mongoose.Schema({
    universe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Universe',
        required: true // Her varlık mutlaka bir evrene ait olmalı
    },
    type: {
        type: String,
        required: true,
        enum: ['character', 'location', 'item', 'lore'] // Şimdilik bu türleri destekleyelim
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    imageUrl: {
        type: String, // Resmin dosya yolu (örn: '/uploads/resim.jpg')
        default: ''   // Başlangıçta resim yok
    },
    // Esnek özellik listesi (Örn: [{ key: "Güç", value: "18" }, { key: "Sınıf", value: "Büyücü" }])
    attributes: [{
        key: { type: String, required: true },
        value: { type: String, required: true }
    }],
    // İleride buraya 'attributes' (Güç, Çeviklik vb.) ekleyeceğiz.
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Entity', EntitySchema);