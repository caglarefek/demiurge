const express = require('express');
const router = express.Router();
const Universe = require('../models/Universe');

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

module.exports = router;