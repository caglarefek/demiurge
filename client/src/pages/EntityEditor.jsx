import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

function EntityEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null); // Gizli dosya inputuna erişmek için
    const [imageUrl, setImageUrl] = useState(''); // Resim yolunu tutmak için
    const [uploading, setUploading] = useState(false); // Yükleniyor animasyonu için
    const [viewMode, setViewMode] = useState('write'); // 'write' (Yaz) veya 'preview' (Önizle)
    const [attributes, setAttributes] = useState([]); // Özellik listesi

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
                setAttributes(data.attributes || []);
            });
    }, [id]);

    // Kaydetme İşlemi
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await fetch(`/api/entities/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, attributes })
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

    // Yeni boş bir özellik satırı ekle
    const addAttribute = () => {
        setAttributes([...attributes, { key: '', value: '' }]);
    };

    // Bir özelliğin ismini veya değerini değiştir
    const handleAttributeChange = (index, field, newValue) => {
        const newAttributes = [...attributes];
        newAttributes[index][field] = newValue;
        setAttributes(newAttributes);
    };

    // Bir özelliği sil
    const deleteAttribute = (index) => {
        const newAttributes = attributes.filter((_, i) => i !== index);
        setAttributes(newAttributes);
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

                {/* --- SEKME BUTONLARI --- */}
                <div style={styles.tabContainer}>
                    <button
                        onClick={() => setViewMode('write')}
                        style={viewMode === 'write' ? styles.tabActive : styles.tabInactive}
                    >
                        ✏️ Yaz
                    </button>
                    <button
                        onClick={() => setViewMode('preview')}
                        style={viewMode === 'preview' ? styles.tabActive : styles.tabInactive}
                    >
                        👁️ Önizleme
                    </button>
                </div>

                {/* --- İÇERİK ALANI (KOŞULLU GÖSTERİM) --- */}
                {viewMode === 'write' ? (
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={styles.descInput}
                        placeholder="Hikayeni Markdown formatında yaz... (# Başlık, **Kalın**)"
                    />
                ) : (
                    <div style={styles.markdownPreview}>
                        {/* Eğer yazı yoksa uyarı ver, varsa render et */}
                        {description ? <ReactMarkdown>{description}</ReactMarkdown> : <span style={{color:'#444'}}>Henüz bir şey yazılmadı.</span>}
                    </div>
                )}

                {/* --- ÖZELLİKLER (STATS) BÖLÜMÜ --- */}
                <div style={styles.statsSection}>
                    <div style={styles.statsHeader}>
                        <h3 style={{color: '#888', margin:0, fontSize:'1rem'}}>Özellikler & Statlar</h3>
                        <button onClick={addAttribute} style={styles.addStatButton}>+ Ekle</button>
                    </div>

                    <div style={styles.statsGrid}>
                        {attributes.map((attr, index) => (
                            <div key={index} style={styles.statRow}>
                                <input
                                    placeholder="Özellik (Örn: Güç)"
                                    value={attr.key}
                                    onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                                    style={styles.statInputKey}
                                />
                                <input
                                    placeholder="Değer (Örn: 18)"
                                    value={attr.value}
                                    onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                                    style={styles.statInputValue}
                                />
                                <button onClick={() => deleteAttribute(index)} style={styles.deleteStatBtn}>×</button>
                            </div>
                        ))}
                    </div>
                </div>

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
    },
    statsSection: {
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #222'
    },
    statsHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
    },
    addStatButton: {
        backgroundColor: '#222',
        color: '#ccc',
        border: '1px solid #333',
        padding: '4px 10px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8rem'
    },
    statsGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    statRow: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
    },
    statInputKey: {
        flex: 1,
        backgroundColor: '#111',
        border: '1px solid #333',
        padding: '10px',
        borderRadius: '4px',
        color: '#aaa',
        fontWeight: 'bold',
        fontSize: '0.9rem'
    },
    statInputValue: {
        flex: 2, // Değer kısmı daha geniş olsun
        backgroundColor: '#000',
        border: '1px solid #333',
        padding: '10px',
        borderRadius: '4px',
        color: '#fff',
        fontSize: '0.9rem'
    },
    deleteStatBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#555',
        fontSize: '1.2rem',
        cursor: 'pointer',
        padding: '0 5px'
    },
    tabContainer: {
        display: 'flex',
        gap: '10px',
        marginBottom: '10px',
        borderBottom: '1px solid #222',
        paddingBottom: '10px'
    },
    tabActive: {
        backgroundColor: '#222',
        color: '#fff',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '0.9rem'
    },
    tabInactive: {
        backgroundColor: 'transparent',
        color: '#666',
        border: 'none',
        padding: '6px 12px',
        cursor: 'pointer',
        fontSize: '0.9rem'
    },

    // Markdown Önizleme Alanı Stilleri
    markdownPreview: {
        minHeight: '400px',
        color: '#ccc',
        lineHeight: '1.7',
        fontSize: '1.05rem',
        fontFamily: 'Georgia, serif', // Okuma modunda daha edebi bir font
        paddingBottom: '50px' // Rahat okuma payı
    }
};

export default EntityEditor;