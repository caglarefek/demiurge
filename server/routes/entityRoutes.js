const express = require('express');
const router = express.Router();
const Entity = require('../models/Entity');
const Template = require('../models/Template');
const upload = require('./uploadMiddleware');
const fs = require('fs');
const path = require('path');

// POST: Yeni bir varlık oluştur (Şablon destekli)
router.post('/', async (req, res) => {
    try {
        const { universeId, type, name, description, templateId } = req.body;

        // Başlangıç özellikleri boş
        let initialAttributes = [];

        // Eğer bir şablon seçildiyse, onun özelliklerini kopyala
        if (templateId) {
            const template = await Template.findById(templateId);
            if (template) {
                // Şablondaki özellikleri al (Key'leri al, Value'ları boş veya varsayılan bırak)
                initialAttributes = template.attributes.map(attr => ({
                    key: attr.key,
                    value: attr.value || ''
                }));
            }
        }

        const newEntity = new Entity({
            universe: universeId,
            type,
            name,
            description,
            attributes: initialAttributes // Kopyalanan özellikleri ekle
        });

        const savedEntity = await newEntity.save();
        res.status(201).json(savedEntity);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET: Belirli bir evrene ve türe ait varlıkları getir
// Örnek: /api/entities?universeId=123&type=character
router.get('/', async (req, res) => {
    try {
        const { universeId, type } = req.query;
        const filter = { universe: universeId };

        if (type) {
            filter.type = type;
        }

        const entities = await Entity.find(filter).sort({ createdAt: -1 });
        res.json(entities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET: Tek bir varlığın detayını getir (Editör için)
router.get('/:id', async (req, res) => {
    try {
        const entity = await Entity.findById(req.params.id);
        if (!entity) return res.status(404).json({ message: 'Varlık bulunamadı' });
        res.json(entity);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT: Varlığı güncelle (İsim veya Açıklama değişince)
router.put('/:id', async (req, res) => {
    try {
        const { name, description, attributes } = req.body;

        // Sadece gelen verileri güncelle
        const updatedEntity = await Entity.findByIdAndUpdate(
            req.params.id,
            { name, description, attributes },
            { new: true } // Güncellenmiş halini geri döndür
        );

        res.json(updatedEntity);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST: Bir varlığa resim yükle
// Bu rota 'upload.single' sayesinde dosyayı alır, kaydeder ve bize bilgisini verir.
router.post('/:id/image', upload.single('image'), async (req, res) => {
    try {
        const entity = await Entity.findById(req.params.id); // Entity modelini kullandığımıza dikkat
        if (!entity) return res.status(404).json({ message: 'Varlık bulunamadı' });

        if (!req.file) return res.status(400).json({ message: 'Dosya seçilmedi' });

        // --- ESKİ RESMİ SİLME İŞLEMİ ---
        if (entity.imageUrl) {
            const filename = entity.imageUrl.split('/uploads/')[1];

            if (filename) {
                const filePath = path.join(__dirname, '../uploads', filename);

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

        const imageUrl = `/uploads/${req.file.filename}`;

        const updatedEntity = await Entity.findByIdAndUpdate(
            req.params.id,
            { imageUrl: imageUrl },
            { new: true }
        );

        res.json(updatedEntity);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE: Bir varlığı sil (Görseliyle birlikte)
router.delete('/:id', async (req, res) => {
    try {
        // 1. Önce silinecek varlığı bul (Veritabanından hemen silme!)
        const entity = await Entity.findById(req.params.id);

        if (!entity) {
            return res.status(404).json({ message: 'Varlık bulunamadı' });
        }

        // 2. Eğer resmi varsa, diskten sil
        if (entity.imageUrl) {
            const filename = entity.imageUrl.split('/uploads/')[1]; // Dosya adını al
            if (filename) {
                const filePath = path.join(__dirname, '../uploads', filename);

                // Dosya var mı diye bakmadan direkt silmeyi dene (Hata verirse de devam et)
                fs.unlink(filePath, (err) => {
                    if (err && err.code !== 'ENOENT') {
                        // ENOENT: Dosya zaten yok demek (Sorun değil)
                        console.error("Görsel silinirken hata oluştu:", err);
                    }
                });
            }
        }

        // 3. Şimdi varlığı veritabanından sil
        await Entity.findByIdAndDelete(req.params.id);

        res.json({ message: 'Varlık ve görseli başarıyla silindi' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;