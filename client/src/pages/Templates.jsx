// client/src/pages/Templates.jsx (GÜNCELLENMİŞ TAM HALİ)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuLayoutTemplate, LuPlus, LuTrash2, LuChevronLeft, LuPencil, LuX } from "react-icons/lu";

function Templates() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);

    // Form State'leri
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null); // Düzenlenen şablonun ID'si (Null ise yeni ekleme)

    const [name, setName] = useState('');
    const [type, setType] = useState('character');
    const [defaultStats, setDefaultStats] = useState([{ key: '', value: '' }]);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        const res = await fetch('/api/templates');
        const data = await res.json();
        setTemplates(data);
    };

    // Formu Temizle ve Kapat
    const resetForm = () => {
        setName('');
        setType('character');
        setDefaultStats([{ key: '', value: '' }]);
        setEditingId(null);
        setShowForm(false);
    };

    const handleAddStat = () => {
        setDefaultStats([...defaultStats, { key: '', value: '' }]);
    };

    const handleStatChange = (index, val) => {
        const newStats = [...defaultStats];
        newStats[index].key = val;
        setDefaultStats(newStats);
    };

    const handleDeleteStat = (index) => {
        const newStats = defaultStats.filter((_, i) => i !== index);
        setDefaultStats(newStats);
    };

    // DÜZENLEME MODUNU AÇAR
    const handleEdit = (template) => {
        setName(template.name);
        setType(template.type);
        // Eğer şablonun özelliği yoksa en az bir boş satır koy
        setDefaultStats(template.attributes.length > 0 ? template.attributes : [{ key: '', value: '' }]);
        setEditingId(template._id);
        setShowForm(true); // Formu aç

        // Sayfanın en üstüne (forma) kaydır
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // HEM YARATMA HEM GÜNCELLEME İŞLEMİNİ YAPAR
    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        if (!name) return;

        const validAttributes = defaultStats.filter(s => s.key.trim() !== '');
        const payload = { name, type, attributes: validAttributes };

        if (editingId) {
            // GÜNCELLEME (PUT)
            await fetch(`/api/templates/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            // YENİ EKLEME (POST)
            await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        resetForm();
        fetchTemplates();
    };

    const handleDelete = async (id) => {
        if(!window.confirm('Bu şablonu silmek istediğine emin misin?')) return;
        await fetch(`/api/templates/${id}`, { method: 'DELETE' });
        // Eğer o an düzenlenen şablon silindiyse formu resetle
        if (editingId === id) resetForm();
        fetchTemplates();
    };

    return (
        <div style={styles.container}>
            <div style={styles.topBar}>
                <button onClick={() => navigate('/')} style={styles.backButton}>
                    <LuChevronLeft /> Ana Menüye Dön
                </button>
                <h2 style={styles.pageTitle}>ŞABLON YÖNETİMİ</h2>
                <div style={{width: '100px'}}></div>
            </div>

            <main style={styles.main}>
                <div style={styles.headerArea}>
                    <p style={{color: 'var(--text-muted)'}}>Yeni karakter ve mekanlar için başlangıç taslakları oluştur.</p>

                    {!showForm && (
                        <button onClick={() => setShowForm(true)} style={styles.createButton}>
                            <LuPlus /> Yeni Şablon
                        </button>
                    )}
                </div>

                {/* --- FORM (Yaratma veya Düzenleme) --- */}
                {showForm && (
                    <div style={styles.formCard}>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                            <h3 style={{margin:0, color:'var(--accent)'}}>
                                {editingId ? 'Şablonu Düzenle' : 'Yeni Şablon Oluştur'}
                            </h3>
                            <button onClick={resetForm} style={styles.closeBtn}><LuX /></button>
                        </div>

                        <div style={styles.formRow}>
                            <input placeholder="Şablon Adı (Örn: D&D 5e Karakter)" value={name} onChange={e=>setName(e.target.value)} style={styles.input} />
                            <select value={type} onChange={e=>setType(e.target.value)} style={styles.select}>
                                <option value="character">Karakter</option>
                                <option value="location">Mekan</option>
                                <option value="lore">Lore</option>
                            </select>
                        </div>

                        <div style={styles.statsArea}>
                            <span style={{fontSize:'0.8rem', color:'var(--text-muted)', width:'100%'}}>Varsayılan Özellikler:</span>
                            {defaultStats.map((stat, index) => (
                                <div key={index} style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                    <input
                                        placeholder="Özellik Adı (Örn: Güç)"
                                        value={stat.key}
                                        onChange={e=>handleStatChange(index, e.target.value)}
                                        style={styles.statInput}
                                    />
                                    {/* Satır silme butonu */}
                                    <button onClick={() => handleDeleteStat(index)} style={styles.deleteStatBtn}>×</button>
                                </div>
                            ))}
                            <button onClick={handleAddStat} style={styles.addStatBtn}>+ Özellik Ekle</button>
                        </div>

                        <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                            <button onClick={handleCreateOrUpdate} style={styles.saveBtn}>
                                {editingId ? 'Güncelle' : 'Kaydet'}
                            </button>
                            <button onClick={resetForm} style={styles.cancelBtn}>Vazgeç</button>
                        </div>
                    </div>
                )}

                {/* --- LİSTE --- */}
                <div style={styles.grid}>
                    {templates.map(t => (
                        <div key={t._id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <LuLayoutTemplate size={24} color="var(--accent)" />
                                <div>
                                    <h3 style={styles.cardTitle}>{t.name}</h3>
                                    <span style={styles.cardType}>{t.type.toUpperCase()}</span>
                                </div>
                            </div>
                            <div style={styles.cardStats}>
                                {t.attributes.map(a => <span key={a._id} style={styles.tag}>{a.key}</span>)}
                            </div>

                            <div style={styles.actionButtons}>
                                {/* DÜZENLE BUTONU */}
                                <button onClick={() => handleEdit(t)} style={styles.editBtn} title="Düzenle">
                                    <LuPencil />
                                </button>
                                {/* SİL BUTONU */}
                                <button onClick={() => handleDelete(t._id)} style={styles.deleteBtn} title="Sil">
                                    <LuTrash2 />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

const styles = {
    container: { height: '100vh', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column' },
    topBar: { padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' },
    backButton: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display:'flex', alignItems:'center', gap:'5px', fontSize:'1rem' },
    pageTitle: { margin:0, fontFamily:'var(--font-heading)', letterSpacing:'2px', color:'var(--text-primary)' },

    main: { flex: 1, padding: '40px', maxWidth: '1000px', margin: '0 auto', width: '100%', overflowY: 'auto' },
    headerArea: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    createButton: { backgroundColor: 'var(--text-primary)', color: 'var(--bg-main)', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' },

    formCard: { backgroundColor: 'var(--bg-card)', padding: '25px', borderRadius: '8px', border: '1px solid var(--accent)', marginBottom: '30px', boxShadow: '0 0 15px rgba(0,0,0,0.5)' },
    formRow: { display: 'flex', gap: '10px', marginBottom: '15px' },
    input: { flex: 2, padding: '10px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: '4px' },
    select: { flex: 1, padding: '10px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: '4px' },

    statsArea: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px', alignItems: 'center' },
    statInput: { padding: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', borderRadius: '4px', width: '150px' },
    addStatBtn: { backgroundColor: 'transparent', border: '1px dashed var(--border-light)', color: 'var(--text-muted)', padding: '8px', borderRadius: '4px', cursor: 'pointer' },
    deleteStatBtn: { background:'none', border:'none', color:'var(--danger)', cursor:'pointer', fontSize:'1.2rem'},

    saveBtn: { flex: 1, padding: '10px', backgroundColor: 'var(--accent)', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
    cancelBtn: { flex: 1, padding: '10px', backgroundColor: 'transparent', border: '1px solid var(--border-light)', color:'var(--text-muted)', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
    closeBtn: { background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'1.2rem'},

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    card: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '20px', borderRadius: '8px', position: 'relative' },
    cardHeader: { display: 'flex', gap: '15px', marginBottom: '15px' },
    cardTitle: { margin: '0 0 5px 0', fontSize: '1.1rem', color: 'var(--text-primary)' },
    cardType: { fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '1px' },
    cardStats: { display: 'flex', flexWrap: 'wrap', gap: '5px' },
    tag: { fontSize: '0.75rem', backgroundColor: 'var(--bg-main)', padding: '4px 8px', borderRadius: '4px', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' },

    actionButtons: { position: 'absolute', top: '15px', right: '15px', display:'flex', gap:'5px' },
    editBtn: { background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize:'1.1rem' },
    deleteBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize:'1.1rem', transition: 'color 0.2s' }
};

export default Templates;