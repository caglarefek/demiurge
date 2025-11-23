const express = require('express');
const router = express.Router();
const Universe = require('../models/Universe');
const Entity = require('../models/Entity');
const upload = require('./uploadMiddleware');
const fs = require('fs');
const path = require('path');

// GET: Tüm evrenleri getir (Ana Sayfa için)
router.get('/', async (req, res) => {
    try {
        const universes = await Universe.find().sort({ createdAt: -1 });
        res.json(universes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- İŞTE EKSİK OLAN KISIM BURASIYDI ---
// GET: Tek bir evreni getir (Dashboard için)
router.get('/:id', async (req, res) => {
    try {
        const universe = await Universe.findById(req.params.id);
        if (!universe) return res.status(404).json({ message: 'Evren bulunamadı' });
        res.json(universe);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// ---------------------------------------

// POST: Yeni evren oluştur
router.post('/', async (req, res) => {
    const universe = new Universe({
        name: req.body.name
    });
    try {
        const newUniverse = await universe.save();
        res.status(201).json(newUniverse);
    } catch (err) {
        res.status(400).json({ message: err.message });
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

// POST: Evren görseli yükle
router.post('/:id/image', upload.single('image'), async (req, res) => {
    try {
        const universe = await Universe.findById(req.params.id);
        if (!universe) return res.status(404).json({ message: 'Evren bulunamadı' });

        if (!req.file) return res.status(400).json({ message: 'Dosya seçilmedi' });

        // --- ESKİ RESMİ SİLME İŞLEMİ ---
        if (universe.imageUrl) {
            // imageUrl şöyledir: "/uploads/dosya_adi.jpg"
            // Bizim dosya ismini alıp tam yolu bulmamız lazım.
            const filename = universe.imageUrl.split('/uploads/')[1];

            if (filename) {
                const filePath = path.join(__dirname, '../uploads', filename);

                // Dosya diskte var mı kontrol et, varsa sil
                fs.access(filePath, fs.constants.F_OK, (err) => {
                    if (!err) {
                        fs.unlink(filePath, (err) => {
                            if (err) console.error("Eski görsel silinirken hata:", err);
                        });
                    }
                });
            }
        }
        // -------------------------------

        // Yeni dosya yolunu kaydet
        universe.imageUrl = `/uploads/${req.file.filename}`;
        await universe.save();

        res.json({ imageUrl: universe.imageUrl });
    } catch (err) {
        console.error("Resim yükleme hatası:", err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE: Evreni sil (Görseli ve içindeki varlıklarla birlikte)
router.delete('/:id', async (req, res) => {
    try {
        // 1. Evreni bul
        const universe = await Universe.findById(req.params.id);
        if (!universe) return res.status(404).json({ message: 'Evren bulunamadı' });

        // 2. Evrenin kapak görselini sil
        if (universe.imageUrl) {
            const filename = universe.imageUrl.split('/uploads/')[1];
            if (filename) {
                const filePath = path.join(__dirname, '../uploads', filename);
                fs.unlink(filePath, (err) => {
                    if (err && err.code !== 'ENOENT') console.error("Evren görseli silinemedi:", err);
                });
            }
        }

        // 3. Evrene ait TÜM varlıkların görsellerini sil (İleri Seviye Temizlik)
        // Burası opsiyonel ama yaparsan tam profesyonel olur.
        // Evren silinince içindeki karakterler de siliniyor ya? Onların resimleri de gitmeli.
        const entities = await Entity.find({ universe: req.params.id });
        entities.forEach(entity => {
            if (entity.imageUrl) {
                const fName = entity.imageUrl.split('/uploads/')[1];
                if (fName) {
                    fs.unlink(path.join(__dirname, '../uploads', fName), () => {});
                }
            }
        });

        // 4. Veritabanı temizliği
        await Entity.deleteMany({ universe: req.params.id }); // Karakterleri sil
        await Universe.findByIdAndDelete(req.params.id); // Evreni sil

        res.json({ message: 'Evren ve tüm içeriği (dosyalar dahil) silindi' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;