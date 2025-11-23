import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuOrbit, LuLayoutTemplate, LuPlus, LuCalendar, LuRocket, LuSettings, LuLibrary, LuPencil, LuTrash2, LuX, LuUpload } from "react-icons/lu";
import { APP_VERSION } from '../constants';

function Home() {
    const navigate = useNavigate();
    const [universes, setUniverses] = useState([]);
    const [newUniverseName, setNewUniverseName] = useState('');

    // --- MODAL STATE'LERİ ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUniverse, setEditingUniverse] = useState(null); // Şu an düzenlenen evren objesi
    const [editName, setEditName] = useState('');
    const fileInputRef = useRef(null); // Resim seçmek için

    useEffect(() => {
        fetchUniverses();
    }, []);

    const fetchUniverses = async () => {
        try {
            const response = await fetch('/api/universes');
            const data = await response.json();
            setUniverses(data);
        } catch (error) {
            console.error('Veri çekme hatası:', error);
        }
    };

    const handleCreateUniverse = async (e) => {
        e.preventDefault();
        if (!newUniverseName.trim()) return;
        try {
            const response = await fetch('/api/universes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newUniverseName })
            });
            if (response.ok) {
                setNewUniverseName('');
                fetchUniverses();
            }
        } catch (error) { console.error('Oluşturma hatası:', error); }
    };

    const handleDelete = async (e, id, name) => {
        e.stopPropagation();
        const confirmMsg = `"${name}" evrenini silmek üzeresin!\n\nDİKKAT: Bu işlem evrenin içindeki TÜM KARAKTERLERİ ve MEKANLARI da silecektir.\n\nEmin misin?`;
        if (!window.confirm(confirmMsg)) return;
        await fetch(`/api/universes/${id}`, { method: 'DELETE' });
        fetchUniverses();
    };

    // --- DÜZENLEME FONKSİYONLARI ---

    // Kalem ikonuna basınca modalı aç
    const openEditModal = (e, universe) => {
        e.stopPropagation();
        setEditingUniverse(universe);
        setEditName(universe.name);
        setShowEditModal(true);
    };

    // Modaldaki Kaydet butonu (İsim güncelleme)
    const handleUpdateUniverse = async () => {
        if (!editName || !editingUniverse) return;
        await fetch(`/api/universes/${editingUniverse._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editName })
        });
        setShowEditModal(false);
        fetchUniverses();
    };

    // Resim Yükleme
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !editingUniverse) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`/api/universes/${editingUniverse._id}/image`, { method: 'POST', body: formData });
            const data = await res.json();
            // State'i güncelle ki modalda resim anında değişsin
            setEditingUniverse({ ...editingUniverse, imageUrl: data.imageUrl });
            fetchUniverses(); // Listeyi de güncelle
        } catch (error) { console.error(error); }
    };

    return (
        <div style={styles.container}>
            <aside style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h1 style={styles.logo}>DEMIURGE</h1>
                    <span style={styles.version}>{APP_VERSION}</span>
                </div>
                <div style={styles.navSection}>
                    <span style={styles.navHeader}>ÇALIŞMA ALANI</span>
                    <div style={styles.navItemActive}><LuOrbit size={20} /><span>Evrenler</span></div>
                </div>
                <div style={styles.divider}></div>
                <div style={styles.navSection}>
                    <span style={styles.navHeader}>KÜTÜPHANE</span>
                    <div style={styles.navItem} onClick={() => navigate('/templates')}><LuLayoutTemplate size={20} /><span>Şablonlar</span></div>
                    <div style={styles.navItem}><LuLibrary size={20} /><span>Varlık Kitaplığı</span></div>
                    <div style={styles.navItem}><LuSettings size={20} /><span>Ayarlar</span></div>
                </div>
            </aside>

            <main style={styles.main}>
                <header style={styles.header}>
                    <h2>TEKRAR HOŞ GELDİN.</h2>
                    <p style={styles.subtext}>Bugün hangi gerçekliği şekillendireceksin?</p>
                </header>
                <div style={styles.actionArea}>
                    <form onSubmit={handleCreateUniverse} style={styles.createForm}>
                        <input type="text" placeholder="Yeni bir evren adı gir..." value={newUniverseName} onChange={(e) => setNewUniverseName(e.target.value)} style={styles.input} spellCheck="false" />
                        <button type="submit" style={styles.button}><LuPlus size={18} /> Oluştur</button>
                    </form>
                </div>
                <h3 style={styles.sectionTitle}>SON ÇALIŞMALAR</h3>

                <div style={styles.grid}>
                    {universes.map((universe) => (
                        <div key={universe._id} style={styles.card} onClick={() => navigate(`/universe/${universe._id}`)} role="button">

                            {/* --- KART GÖRSELİ (Resim varsa onu göster, yoksa Roket) --- */}
                            <div style={{
                                ...styles.cardIconBox,
                                backgroundImage: universe.imageUrl ? `url(${universe.imageUrl})` : 'none',
                                backgroundSize: 'cover', backgroundPosition: 'center'
                            }}>
                                {!universe.imageUrl && <LuRocket size={24} color="var(--text-primary)" />}
                            </div>

                            <div style={{flex: 1}}>
                                <h3 style={styles.cardTitle}>{universe.name}</h3>
                                <div style={styles.cardMeta}><LuCalendar size={12} /><span>Last edited: {new Date(universe.createdAt).toLocaleDateString('tr-TR')}</span></div>
                            </div>
                            <div style={styles.actionButtons}>
                                {/* Kalem butonuna tıklayınca artık modal açılıyor */}
                                <button onClick={(e) => openEditModal(e, universe)} style={styles.iconBtn} title="Düzenle"><LuPencil /></button>
                                <button onClick={(e) => handleDelete(e, universe._id, universe.name)} style={{...styles.iconBtn, color: 'var(--danger)'}} title="Evreni Sil"><LuTrash2 /></button>
                            </div>
                        </div>
                    ))}
                    {universes.length === 0 && (
                        <div style={styles.emptyState}><LuOrbit size={40} style={{ opacity: 0.2, marginBottom: '10px' }} /><p>Henüz hiç evren oluşturulmadı.</p></div>
                    )}
                </div>
            </main>

            {/* --- DÜZENLEME MODALI (POP-UP) --- */}
            {showEditModal && editingUniverse && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h3>Evreni Düzenle</h3>
                            <button onClick={() => setShowEditModal(false)} style={styles.closeBtn}><LuX /></button>
                        </div>

                        {/* Resim Yükleme Alanı */}
                        <div
                            style={{
                                ...styles.imageUploadArea,
                                backgroundImage: editingUniverse.imageUrl ? `url(${editingUniverse.imageUrl})` : 'none'
                            }}
                            onClick={() => fileInputRef.current.click()}
                        >
                            {!editingUniverse.imageUrl && <span style={{display:'flex', alignItems:'center', gap:'10px'}}><LuUpload /> Görsel Seç</span>}
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{display:'none'}} accept="image/*" />
                        </div>

                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={styles.input} placeholder="Evren Adı" />

                        <button onClick={handleUpdateUniverse} style={styles.saveButtonModal}>Kaydet</button>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: { display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--bg-main)' },
    sidebar: { width: '280px', backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)', padding: '30px 20px', display: 'flex', flexDirection: 'column' },
    logoArea: { marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingLeft: '10px' },
    logo: { fontSize: '1.4rem', fontWeight: 'bold', letterSpacing: '4px', margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' },
    version: { fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '5px', display: 'block' },
    navSection: { display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' },
    navHeader: { fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '10px', paddingLeft: '12px', marginTop: '10px' },
    divider: { height: '1px', backgroundColor: 'var(--border-subtle)', margin: '15px 0' },
    navItem: { padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-body)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', fontWeight: '500' },
    navItemActive: { padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold' },
    main: { flex: 1, padding: '60px 80px', overflowY: 'auto' },
    header: { marginBottom: '40px' },
    subtext: { color: 'var(--text-muted)', marginTop: '8px', fontSize: '1rem' },
    actionArea: { marginBottom: '50px' },
    createForm: { display: 'flex', gap: '15px', maxWidth: '600px' },
    input: { flex: 1, padding: '15px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '1rem' },
    button: { padding: '0 30px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-main)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' },
    sectionTitle: { fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '20px', fontWeight: '600' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
    card: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '25px', borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)', position: 'relative' },
    // GÜNCELLENDİ: Resim varsa taşmasın diye overflow hidden
    cardIconBox: { width: '60px', height: '60px', backgroundColor: 'var(--bg-main)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)', overflow: 'hidden' },
    cardTitle: { margin: '0 0 6px 0', color: 'var(--text-primary)', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' },
    cardMeta: { fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' },
    emptyState: { color: 'var(--text-muted)', marginTop: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    actionButtons: { display: 'flex', gap: '5px', opacity: 0.4, transition: 'opacity 0.2s' },
    iconBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px', fontSize: '1.1rem', borderRadius: '4px', transition: 'color 0.2s, background 0.2s' },

    // --- MODAL STİLLERİ ---
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    modalContent: { backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '12px', width: '500px', border: '1px solid var(--border-subtle)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    closeBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' },
    imageUploadArea: { width: '100%', height: '200px', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '2px dashed var(--border-light)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '20px', backgroundSize: 'cover', backgroundPosition: 'center' },
    saveButtonModal: { width: '100%', marginTop: '20px', padding: '12px', backgroundColor: 'var(--accent)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }
};

export default Home;