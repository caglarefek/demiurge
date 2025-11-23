const express = require('express');
const router = express.Router();
const Template = require('../models/Template');

// GET: Tüm şablonları getir
router.get('/', async (req, res) => {
    try {
        const templates = await Template.find().sort({ createdAt: -1 });
        res.json(templates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST: Yeni şablon oluştur
router.post('/', async (req, res) => {
    const { name, type, attributes } = req.body;
    const newTemplate = new Template({ name, type, attributes });

    try {
        const savedTemplate = await newTemplate.save();
        res.status(201).json(savedTemplate);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE: Şablon sil
router.delete('/:id', async (req, res) => {
    try {
        await Template.findByIdAndDelete(req.params.id);
        res.json({ message: 'Şablon silindi' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;