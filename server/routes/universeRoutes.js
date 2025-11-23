const express = require('express');
const router = express.Router();
const Universe = require('../models/Universe');
const Entity = require('../models/Entity');

// GET: Tüm evrenleri getir (En son oluşturulan en başta)
router.get('/', async (req, res) => {
    try {
        const universes = await Universe.find().sort({ createdAt: -1 });
        res.json(universes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST: Yeni evren oluştur
router.post('/', async (req, res) => {
    const { name, description } = req.body;

    const newUniverse = new Universe({
        name: name,
        description: description
    });

    try {
        const savedUniverse = await newUniverse.save();
        res.status(201).json(savedUniverse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const universe = await Universe.findById(req.params.id);
        if (!universe) return res.status(404).json({ message: 'Evren bulunamadı' });
        res.json(universe);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT: Evren ismini güncelle
router.put('/:id', async (req, res) => {
    try {
        const { name } = req.body;
        const updatedUniverse = await Universe.findByIdAndUpdate(
            req.params.id,
            { name },
            { new: true }
        );
        res.json(updatedUniverse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE: Evreni ve içindeki her şeyi sil (Cascade Delete)
router.delete('/:id', async (req, res) => {
    try {
        // 1. Önce bu evrene ait tüm varlıkları (Entity) sil
        await Entity.deleteMany({ universe: req.params.id });

        // 2. Sonra evrenin kendisini sil
        await Universe.findByIdAndDelete(req.params.id);

        res.json({ message: 'Evren ve tüm içeriği silindi' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;