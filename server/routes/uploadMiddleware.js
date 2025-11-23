const multer = require('multer');
const path = require('path');

// Depolama ayarları (Dosyalar nereye kaydedilecek?)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 'uploads' klasörüne kaydet
    },
    filename: (req, file, cb) => {
        // Dosya adını benzersiz yap (zaman damgası + orijinal uzantı)
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Dosya filtresi (Sadece resimlere izin ver)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Kabul et
    } else {
        cb(new Error('Sadece resim dosyaları yüklenebilir!'), false); // Reddet
    }
};

// Multer konfigürasyonu
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // BURAYI DEĞİŞTİR: 10MB limit (10 * 1024 * 1024 byte)
    }
});

module.exports = upload;