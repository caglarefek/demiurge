import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EntityEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null); // Gizli dosya inputuna erişmek için
    const [imageUrl, setImageUrl] = useState(''); // Resim yolunu tutmak için
    const [uploading, setUploading] = useState(false); // Yükleniyor animasyonu için

    const [entity, setEntity] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Veriyi Çek
    useEffect(() => {
        fetch(`/api/entities/${id}`)
            .then(res => res.json())
            .then(data => {
                setEntity(data);
                setName(data.name);
                setDescription(data.description);
                setImageUrl(data.imageUrl);
            });
    }, [id]);

    // Kaydetme İşlemi
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await fetch(`/api/entities/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description })
            });
            // Kaydettikten sonra geri dönelim mi? Hayır, yazmaya devam edebilirsin.
            // Sadece kullanıcıya hissettirelim (butonda yazar).
            setTimeout(() => setIsSaving(false), 500);
        } catch (error) {
            console.error('Hata:', error);
            setIsSaving(false);
        }
    };

    // Resim seçilince otomatik çalışacak fonksiyon
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const response = await fetch(`/api/entities/${id}/image`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            setImageUrl(data.imageUrl); // Yeni resmi hemen göster
        } catch (error) {
            console.error('Resim yükleme hatası:', error);
        } finally {
            setUploading(false);
        }
    };

    if (!entity) return <div style={{padding:'40px', color:'white'}}>Yükleniyor...</div>;

    return (
        <div style={styles.container}>

            {/* --- KAPAK RESMİ ALANI --- */}
            <div
                style={{
                    ...styles.coverImage,
                    backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                    height: imageUrl ? '300px' : '100px' // Resim yoksa dar, varsa geniş
                }}
            >
                <div style={styles.coverOverlay}>
                    <button
                        style={styles.uploadButton}
                        onClick={() => fileInputRef.current.click()} // Gizli inputu tetikle
                    >
                        {uploading ? 'Yükleniyor...' : '📷 Kapak Resmi Ekle/Değiştir'}
                    </button>

                    {/* Gizli Dosya Inputu */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                        accept="image/*"
                    />
                </div>
            </div>


            {/* --- EDİTÖR BAŞLIK VE İÇERİK --- */}
            <div style={styles.editorContainer}>
                {/* Üst Bar (Geri ve Kaydet) */}
                <div style={styles.topBar}>
                    <button onClick={() => navigate(-1)} style={styles.backButton}>← Geri</button>
                    <span style={styles.typeTag}>{entity.type.toUpperCase()}</span>
                    <button onClick={handleSave} style={styles.saveButton}>
                        {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>

                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.titleInput}
                    placeholder="İsimsiz Varlık"
                />

                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={styles.descInput}
                    placeholder="Hikayeni buraya yaz..."
                />
            </div>

        </div>
    );
}

const styles = {
    container: { height: '100vh', backgroundColor: '#0a0a0a', display: 'flex', flexDirection: 'column', overflowY: 'auto' },

    // Kapak Resmi Stilleri
    coverImage: {
        width: '100%',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#1a1a1a', // Resim yokken görünecek renk
        position: 'relative',
        transition: 'height 0.3s ease'
    },
    coverOverlay: {
        position: 'absolute',
        bottom: '10px',
        right: '20px',
        opacity: 0.7,
        transition: 'opacity 0.2s'
    },
    uploadButton: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        color: '#fff',
        border: '1px solid #555',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        backdropFilter: 'blur(4px)'
    },

    // Editör Alanı
    editorContainer: {
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto', // Ortala
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid #222',
        paddingBottom: '10px'
    },
    backButton: { background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1rem' },
    saveButton: { backgroundColor: '#ededed', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    typeTag: { fontSize: '0.8rem', letterSpacing: '2px', color: '#444' },

    titleInput: { backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: '2.5rem', fontWeight: 'bold', outline: 'none', width: '100%' },
    descInput: {
        width: '100%',
        minHeight: '400px', // Yeterince uzun olsun
        backgroundColor: 'transparent',
        border: 'none',
        color: '#ccc',
        fontSize: '1.1rem',
        lineHeight: '1.6',
        outline: 'none',
        resize: 'none',
        fontFamily: 'inherit'
    }
};

export default EntityEditor;