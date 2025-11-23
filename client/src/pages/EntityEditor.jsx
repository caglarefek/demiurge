// client/src/pages/EntityEditor.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown'; // Kütüphaneyi geri çağırdık
import WikiLinkRenderer from '../components/WikiLinkRenderer'; // Bunu artık kullanmayacağız ama import kalsa da zarar gelmez

function EntityEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [entity, setEntity] = useState(null);
    const [allEntities, setAllEntities] = useState([]); // Diğer varlıklar (Linkleme için)

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [attributes, setAttributes] = useState([]);
    const [imageUrl, setImageUrl] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [viewMode, setViewMode] = useState('write');

    // --- 1. VERİLERİ ÇEKME ---
    useEffect(() => {
        fetch(`/api/entities/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Veri çekilemedi");
                return res.json();
            })
            .then(data => {
                setEntity(data);
                setName(data.name || '');
                setDescription(data.description || '');
                setImageUrl(data.imageUrl || '');
                setAttributes(data.attributes || []);
            })
            .catch(err => console.error("Hata:", err));
    }, [id]);

    // Linkleme için tüm varlıkları çek
    useEffect(() => {
        if (entity) {
            fetch(`/api/entities?universeId=${entity.universe}`)
                .then(res => res.json())
                .then(data => setAllEntities(data));
        }
    }, [entity]);

    // --- 2. FONKSİYONLAR ---

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await fetch(`/api/entities/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, attributes })
            });
            setTimeout(() => setIsSaving(false), 500);
        } catch (error) {
            console.error('Hata:', error);
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`"${name}" adlı varlığı silmek istediğine emin misin?`)) return;
        try {
            const response = await fetch(`/api/entities/${id}`, { method: 'DELETE' });
            if (response.ok) navigate(-1);
        } catch (error) { console.error(error); }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);
        try {
            const response = await fetch(`/api/entities/${id}/image`, { method: 'POST', body: formData });
            const data = await response.json();
            setImageUrl(data.imageUrl);
        } catch (error) { console.error(error); }
        finally { setUploading(false); }
    };

    // Stat Yönetimi
    const addAttribute = () => setAttributes([...attributes, { key: '', value: '' }]);
    const handleAttributeChange = (index, field, newValue) => {
        const newAttributes = [...attributes];
        newAttributes[index][field] = newValue;
        setAttributes(newAttributes);
    };
    const deleteAttribute = (index) => {
        setAttributes(attributes.filter((_, i) => i !== index));
    };

    // --- 3. WIKI LINK DÖNÜŞTÜRÜCÜ (SİHİRLİ KISIM) ---
    // [[Gandalf]] yazısını bulup [Gandalf](/entity/123) formatına çevirir
    const processMarkdown = (text) => {
        if (!text) return '';

        // Regex: [[...]] arasındaki metni yakala
        return text.replace(/\[\[(.*?)\]\]/g, (match, cleanName) => {
            // Bu isme sahip varlığı bul
            const target = allEntities.find(e => e.name.toLowerCase() === cleanName.toLowerCase());

            if (target) {
                // Varlık varsa: Standart Markdown Linkine çevir
                return `[${cleanName}](/entity/${target._id})`;
            } else {
                // Varlık yoksa: Sadece kalın yaz ama link verme (veya kırmızı yap)
                return `**${cleanName} (?)**`;
            }
        });
    };

    if (!entity) return <div style={{padding:'40px', color:'white'}}>Yükleniyor...</div>;

    return (
        <div style={styles.container}>

            {/* Kapak Resmi */}
            <div style={{...styles.coverImage, backgroundImage: imageUrl ? `url(${imageUrl})` : 'none', height: imageUrl ? '300px' : '100px'}}>
                <div style={styles.coverOverlay}>
                    <button style={styles.uploadButton} onClick={() => fileInputRef.current.click()}>
                        {uploading ? 'Yükleniyor...' : '📷 Kapak Resmi Ekle/Değiştir'}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} accept="image/*"/>
                </div>
            </div>

            <div style={styles.editorContainer}>
                {/* Üst Bar */}
                <div style={styles.topBar}>
                    <div style={{display:'flex', gap:'10px'}}>
                        <button onClick={() => navigate(-1)} style={styles.backButton}>← Geri</button>
                        <button onClick={handleDelete} style={styles.deleteButton}>🗑️ Sil</button>
                    </div>
                    <span style={styles.typeTag}>{entity.type.toUpperCase()}</span>
                    <button onClick={handleSave} style={styles.saveButton}>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</button>
                </div>

                {/* Başlık Input */}
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.titleInput}
                    placeholder="İsimsiz Varlık"
                />

                {/* Sekmeler */}
                <div style={styles.tabContainer}>
                    <button onClick={() => setViewMode('write')} style={viewMode === 'write' ? styles.tabActive : styles.tabInactive}>✏️ Yaz</button>
                    <button onClick={() => setViewMode('preview')} style={viewMode === 'preview' ? styles.tabActive : styles.tabInactive}>👁️ Önizleme</button>
                </div>

                {/* --- İÇERİK ALANI --- */}
                {viewMode === 'write' ? (
                    <textarea
                        value={description || ''}
                        onChange={(e) => setDescription(e.target.value)}
                        style={styles.descInput}
                        placeholder="Hikayeni Markdown formatında yaz... (# Başlık, **Kalın**, [[WikiLink]])"
                    />
                ) : (
                    <div style={styles.markdownPreview}>
                        {/* ReactMarkdown Kullanıyoruz */}
                        <ReactMarkdown
                            components={{
                                // Linklerin sayfa yenilememesi için özel ayar
                                a: ({node, ...props}) => (
                                    <Link to={props.href} style={{color: '#d4d4d8', textDecoration: 'underline', fontWeight: 'bold'}}>
                                        {props.children}
                                    </Link>
                                )
                            }}
                        >
                            {processMarkdown(description)}
                        </ReactMarkdown>
                    </div>
                )}

                {/* Statlar */}
                <div style={styles.statsSection}>
                    <div style={styles.statsHeader}>
                        <h3 style={{color: '#888', margin:0, fontSize:'1rem'}}>Özellikler & Statlar</h3>
                        <button onClick={addAttribute} style={styles.addStatButton}>+ Ekle</button>
                    </div>
                    <div style={styles.statsGrid}>
                        {attributes.map((attr, index) => (
                            <div key={index} style={styles.statRow}>
                                <input placeholder="Özellik" value={attr.key} onChange={(e) => handleAttributeChange(index, 'key', e.target.value)} style={styles.statInputKey} />
                                <input placeholder="Değer" value={attr.value} onChange={(e) => handleAttributeChange(index, 'value', e.target.value)} style={styles.statInputValue} />
                                <button onClick={() => deleteAttribute(index)} style={styles.deleteStatBtn}>×</button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

// Stillerin aynen kalsın (sadece dosya sonundaki stil objesini değiştirmedim, önceki adımdaki en son halini kullanabilirsin)
// Ama global CSS (index.css) içindeki input ayarlarını yaptığımızdan emin ol.
const styles = {
    container: { height: '100vh', backgroundColor: '#0a0a0a', display: 'flex', flexDirection: 'column', overflowY: 'auto' },
    coverImage: { width: '100%', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#1a1a1a', position: 'relative', transition: 'height 0.3s ease' },
    coverOverlay: { position: 'absolute', bottom: '10px', right: '20px', opacity: 0.7, transition: 'opacity 0.2s' },
    uploadButton: { backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid #555', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', backdropFilter: 'blur(4px)' },
    editorContainer: { maxWidth: '800px', width: '100%', margin: '0 auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '10px' },
    backButton: { background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1rem' },
    deleteButton: { backgroundColor: 'transparent', color: '#ff4444', border: '1px solid #ff4444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', marginLeft:'10px' },
    saveButton: { backgroundColor: '#ededed', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    typeTag: { fontSize: '0.8rem', letterSpacing: '2px', color: '#444' },
    titleInput: { backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid var(--border-light)', color: 'var(--text-primary)', fontSize: '2.5rem', fontWeight: 'bold', outline: 'none', width: '100%', padding: '10px 0', fontFamily: 'var(--font-heading)' },
    descInput: { width: '100%', minHeight: '400px', backgroundColor: 'transparent', border: 'none', color: 'var(--text-body)', fontSize: '1.1rem', lineHeight: '1.8', outline: 'none', resize: 'none', fontFamily: 'var(--font-body)', marginTop: '20px', whiteSpace: 'pre-wrap' },

    // Sekmeler
    tabContainer: { display: 'flex', gap: '10px', marginBottom: '10px', borderBottom: '1px solid #222', paddingBottom: '10px' },
    tabActive: { backgroundColor: '#222', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' },
    tabInactive: { backgroundColor: 'transparent', color: '#666', border: 'none', padding: '6px 12px', cursor: 'pointer', fontSize: '0.9rem' },
    markdownPreview: { minHeight: '400px', color: '#ccc', lineHeight: '1.7', fontSize: '1.05rem', fontFamily: 'Georgia, serif', paddingBottom: '50px' },

    // Statlar
    statsSection: { marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #222' },
    statsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    addStatButton: { backgroundColor: '#222', color: '#ccc', border: '1px solid #333', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
    statsGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
    statRow: { display: 'flex', gap: '10px', alignItems: 'center' },
    statInputKey: { flex: 1, backgroundColor: '#111', border: '1px solid #333', padding: '10px', borderRadius: '4px', color: '#aaa', fontWeight: 'bold', fontSize: '0.9rem' },
    statInputValue: { flex: 2, backgroundColor: '#000', border: '1px solid #333', padding: '10px', borderRadius: '4px', color: '#fff', fontSize: '0.9rem' },
    deleteStatBtn: { backgroundColor: 'transparent', border: 'none', color: '#555', fontSize: '1.2rem', cursor: 'pointer', padding: '0 5px' }
};

export default EntityEditor;