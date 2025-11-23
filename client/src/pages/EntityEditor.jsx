import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { LuChevronLeft } from "react-icons/lu";

function EntityEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [entity, setEntity] = useState(null);
    const [allEntities, setAllEntities] = useState([]);

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

    // --- 3. WIKI LINK DÖNÜŞTÜRÜCÜ ---
    const processMarkdown = (text) => {
        if (!text) return '';
        return text.replace(/\[\[(.*?)\]\]/g, (match, cleanName) => {
            const target = allEntities.find(e => e.name.toLowerCase() === cleanName.toLowerCase());
            if (target) {
                return `[${cleanName}](/entity/${target._id})`;
            } else {
                return `**${cleanName} (?)**`;
            }
        });
    };

    if (!entity) return <div style={{padding:'40px', color:'white'}}>Yükleniyor...</div>;

    return (
        <div style={styles.container}>

            {/* Üst Bar */}
            <div style={styles.topBar}>
                <div style={{display:'flex', gap:'10px'}}>
                    <button onClick={() => navigate(-1)} style={styles.backButton}>
                        <LuChevronLeft /> Geri
                    </button>
                    <button onClick={handleDelete} style={styles.deleteButton}>🗑️ Sil</button>
                </div>

                <span style={styles.typeTag}>{entity.type.toUpperCase()}</span>

                <button onClick={handleSave} style={styles.saveButton}>
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>

            {/* --- İKİ SÜTUNLU ANA YAPI --- */}
            <div style={styles.contentFlex}>

                {/* === SOL SÜTUN: EDİTÖR === */}
                <div style={styles.mainColumn}>
                    {/* Başlık Input */}
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={styles.titleInput}
                        placeholder="İsimsiz Varlık"
                        spellCheck="false"
                    />

                    {/* Sekmeler */}
                    <div style={styles.tabContainer}>
                        <button onClick={() => setViewMode('write')} style={viewMode === 'write' ? styles.tabActive : styles.tabInactive}>✏️ Yaz</button>
                        <button onClick={() => setViewMode('preview')} style={viewMode === 'preview' ? styles.tabActive : styles.tabInactive}>👁️ Önizleme</button>
                    </div>

                    {/* İçerik Alanı */}
                    {viewMode === 'write' ? (
                        <textarea
                            value={description || ''}
                            onChange={(e) => setDescription(e.target.value)}
                            style={styles.descInput}
                            placeholder="Hikayeni Markdown formatında yaz..."
                            spellCheck="false"
                        />
                    ) : (
                        <div style={styles.markdownPreview}>
                            <ReactMarkdown components={{
                                a: ({node, ...props}) => (
                                    <Link to={props.href} style={{color: '#d4d4d8', textDecoration: 'underline', fontWeight: 'bold'}}>
                                        {props.children}
                                    </Link>
                                )
                            }}>
                                {processMarkdown(description)}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* === SAĞ SÜTUN: GÖRSEL VE STATLAR === */}
                <aside style={styles.sidebarColumn}>

                    {/* Dikey Karakter Resmi */}
                    <div
                        style={{
                            ...styles.portraitImage,
                            backgroundImage: imageUrl
                                ? `linear-gradient(to bottom, rgba(10,10,10,0) 60%, #0a0a0a 100%), url(${imageUrl})`
                                : 'none',
                        }}
                        onClick={() => fileInputRef.current.click()}
                    >
                        {!imageUrl && <span style={{color:'#666'}}>Resim Yok</span>}

                        <button style={styles.uploadButtonSmall}>
                            {uploading ? '...' : '📷 Değiştir'}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} accept="image/*"/>
                    </div>

                    {/* Statlar */}
                    <div style={styles.statsSectionSide}>
                        <div style={styles.statsHeader}>
                            {/* DÜZELTME: Rengi parlattık (var(--text-primary)) ve opacity ekledik */}
                            <h3 style={{color: 'var(--text-primary)', opacity: 0.8, margin:0, fontSize:'0.9rem', letterSpacing:'2px', fontFamily: 'var(--font-heading)'}}>
                                ÖZELLİKLER
                            </h3>
                            <button onClick={addAttribute} style={styles.addStatButton}>+ Ekle</button>
                        </div>
                        <div style={styles.statsGrid}>
                            {attributes.map((attr, index) => (
                                <div key={index} style={styles.statRow}>
                                    <input placeholder="Özellik" value={attr.key} onChange={(e) => handleAttributeChange(index, 'key', e.target.value)} style={styles.statInputKey} spellCheck="false" />
                                    <input placeholder="Değer" value={attr.value} onChange={(e) => handleAttributeChange(index, 'value', e.target.value)} style={styles.statInputValue} spellCheck="false" />
                                    <button onClick={() => deleteAttribute(index)} style={styles.deleteStatBtn}>×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                </aside>

            </div>
        </div>
    );
}

const styles = {
    container: { height: '100vh', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    topBar: { padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-main)', zIndex: 10 },
    backButton: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.95rem', display:'flex', alignItems:'center', gap:'5px' },
    deleteButton: { backgroundColor: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', marginLeft:'10px' },
    saveButton: { backgroundColor: 'var(--accent)', border: 'none', padding: '8px 25px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color:'#000' },
    typeTag: { fontSize: '0.8rem', letterSpacing: '2px', color: 'var(--text-muted)' },
    contentFlex: { flex: 1, display: 'flex', overflow: 'hidden', padding: '30px', gap: '40px', maxWidth: '1400px', margin: '0 auto', width: '100%' },
    mainColumn: { flex: 3, overflowY: 'auto', paddingRight: '10px' },
    titleInput: { backgroundColor: 'transparent', border: 'none', borderBottom: '2px solid var(--border-light)', color: 'var(--text-primary)', fontSize: '2.5rem', fontWeight: 'bold', outline: 'none', width: '100%', padding: '10px 0', fontFamily: 'var(--font-heading)', marginBottom: '20px' },
    tabContainer: { display: 'flex', gap: '10px', marginBottom: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' },
    tabActive: { backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-primary)', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' },
    tabInactive: { backgroundColor: 'transparent', color: 'var(--text-muted)', border: 'none', padding: '6px 12px', cursor: 'pointer', fontSize: '0.9rem' },
    descInput: { width: '100%', minHeight: '600px', backgroundColor: 'transparent', border: 'none', color: 'var(--text-body)', fontSize: '1.1rem', lineHeight: '1.8', outline: 'none', resize: 'none', fontFamily: 'var(--font-body)', marginTop: '20px', whiteSpace: 'pre-wrap' },
    markdownPreview: { minHeight: '600px', color: 'var(--text-body)', lineHeight: '1.7', fontSize: '1.05rem', fontFamily: 'Georgia, serif', marginTop: '20px' },

    sidebarColumn: { flex: 1, minWidth: '300px', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' },
    portraitImage: { width: '100%', aspectRatio: '2 / 3', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)', backgroundSize: 'cover', backgroundPosition: 'top center', position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' },
    uploadButtonSmall: { position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', border: '1px solid var(--border-subtle)', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', backdropFilter: 'blur(4px)' },

    // STAT STİLLERİ (DÜZELTİLDİ)
    statsSectionSide: { backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' },
    statsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    addStatButton: { backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
    statsGrid: { display: 'flex', flexDirection: 'column', gap: '8px' }, // Gap azaltıldı
    statRow: { display: 'flex', gap: '8px', alignItems: 'center' }, // Gap azaltıldı

    // DÜZELTME: minWidth: 0 eklenerek taşma engellendi
    statInputKey: { flex: 1, minWidth: 0, backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-subtle)', padding: '8px', borderRadius: '4px', color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.85rem' },
    statInputValue: { flex: 1.5, minWidth: 0, backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-subtle)', padding: '8px', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.85rem' },

    deleteStatBtn: { backgroundColor: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', padding: '0 5px', flexShrink: 0 }
};

export default EntityEditor;