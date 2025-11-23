import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { LuLayoutDashboard, LuUsers, LuMap, LuScroll, LuSwords, LuPlus, LuChevronLeft } from "react-icons/lu";

function UniverseDashboard() {
    const { id } = useParams();
    const [universe, setUniverse] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // Hangi sekmedeyiz?
    const [entities, setEntities] = useState([]); // Listelenecek varlıklar

    // Yeni Varlık Ekleme Formu için State
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const navigate = useNavigate();

    // 1. Evren Bilgisini Çek
    useEffect(() => {
        fetch(`/api/universes/${id}`)
            .then(res => res.json())
            .then(data => setUniverse(data));
    }, [id]);

    // 2. Sekme değişince ilgili varlıkları çek (Karakterler, Mekanlar vs.)
    useEffect(() => {
        if (activeTab === 'overview') return;

        // API'den verileri iste: ?universeId=...&type=character
        fetch(`/api/entities?universeId=${id}&type=${activeTab}`)
            .then(res => res.json())
            .then(data => setEntities(data));
    }, [id, activeTab]);

    // Yeni Varlık Oluşturma Fonksiyonu
    const handleCreateEntity = async (e) => {
        e.preventDefault();
        if (!newName) return;

        const response = await fetch('/api/entities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                universeId: id,
                type: activeTab, // O an hangi sekmedeysek o türde oluştur (character/location)
                name: newName,
                description: newDesc
            })
        });

        if (response.ok) {
            const savedEntity = await response.json();
            setEntities([savedEntity, ...entities]); // Listeye hemen ekle
            setNewName('');
            setNewDesc('');
            setShowForm(false);
        }
    };

    if (!universe) return <div style={{padding:'40px', color:'white'}}>Yükleniyor...</div>;

    return (
        <div style={styles.container}>

            {/* --- SIDEBAR --- */}
            <aside style={styles.sidebar}>
                <div style={styles.backArea}>
                    <Link to="/" style={styles.backLink}>← Evrenlere Dön</Link>
                </div>
                <div style={styles.universeTitle}>{universe.name}</div>

                <nav style={styles.nav}>
                    <NavButton icon={<LuLayoutDashboard />} label="Genel Bakış" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <NavButton icon={<LuUsers />} label="Karakterler" active={activeTab === 'character'} onClick={() => setActiveTab('character')} />
                    <NavButton icon={<LuMap />} label="Mekanlar" active={activeTab === 'location'} onClick={() => setActiveTab('location')} />
                    <NavButton icon={<LuScroll />} label="Lore & Tarih" active={activeTab === 'lore'} onClick={() => setActiveTab('lore')} />
                </nav>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main style={styles.main}>
                {/* Başlık Alanı */}
                <header style={styles.header}>
                    <h2>
                        {activeTab === 'overview' && 'Genel Bakış'}
                        {activeTab === 'character' && 'Karakterler'}
                        {activeTab === 'location' && 'Mekanlar'}
                        {activeTab === 'lore' && 'Lore & Tarih'}
                    </h2>

                    {/* Sadece Genel Bakış'ta olmayan sekmelerde 'Yeni Ekle' butonu göster */}
                    {activeTab !== 'overview' && (
                        <button style={styles.addButton} onClick={() => setShowForm(!showForm)}>
                            {/* Eğer form açıksa Çarpı (LuX), kapalıysa Artı (LuPlus) göster */}
                            {showForm ? (
                                <>
                                    <LuX size={18} /> İptal
                                </>
                            ) : (
                                <>
                                    <LuPlus size={18} /> Yeni Ekle
                                </>
                            )}
                        </button>
                    )}
                </header>

                {/* --- FORM ALANI (Varsa göster) --- */}
                {showForm && activeTab !== 'overview' && (
                    <form onSubmit={handleCreateEntity} style={styles.formBox}>
                        <input
                            style={styles.input}
                            placeholder="İsim..."
                            value={newName} onChange={e => setNewName(e.target.value)}
                            autoFocus
                        />
                        <input
                            style={styles.input}
                            placeholder="Kısa açıklama..."
                            value={newDesc} onChange={e => setNewDesc(e.target.value)}
                        />
                        <button type="submit" style={styles.saveButton}>Kaydet</button>
                    </form>
                )}

                {/* --- İÇERİK LİSTESİ --- */}
                {activeTab === 'overview' ? (
                    <p style={{color: '#666'}}>Hoş geldin. Soldan bir kategori seç.</p>
                ) : (
                    <div style={styles.grid}>
                        {entities.length === 0 && !showForm && <p style={{color:'#666'}}>Burada henüz hiç kayıt yok.</p>}

                        {entities.map(entity => (
                            <div
                                key={entity._id}
                                style={styles.card}
                                onClick={() => navigate(`/entity/${entity._id}`)} // <-- Tıklama özelliği
                                role="button" // Erişilebilirlik için
                            >
                                <div style={styles.cardIcon}>
                                    {entity.type === 'character' ? <LuUsers /> : entity.type === 'location' ? <LuMap /> : <LuScroll />}
                                </div>
                                <div>
                                    <h4 style={styles.cardTitle}>{entity.name}</h4>
                                    <p style={styles.cardDesc}>{entity.description || 'Açıklama yok.'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

// Yardımcı Bileşen: Menü Butonu (İkon Destekli)
const NavButton = ({ label, icon, active, onClick }) => (
    <div onClick={onClick} style={{
        ...styles.navItem,
        backgroundColor: active ? 'var(--bg-card-hover)' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-body)',
        borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent', // Aktifken solda çizgi
    }}>
        <span style={{ fontSize: '1.2rem', display:'flex' }}>{icon}</span>
        <span>{label}</span>
    </div>
);

const styles = {
    container: { display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--bg-main)' },

    // Sidebar
    sidebar: { width: '260px', backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)', padding: '25px', display: 'flex', flexDirection: 'column' },
    backArea: { marginBottom: '30px' },
    backLink: { color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px', transition: 'color 0.2s' },
    universeTitle: { fontSize: '1.4rem', marginBottom: '40px', paddingBottom: '15px', borderBottom: '1px solid var(--border-subtle)', letterSpacing: '1px' },

    nav: { display: 'flex', flexDirection: 'column', gap: '8px' },
    navItem: { padding: '12px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' },

    // Main
    main: { flex: 1, padding: '60px', overflowY: 'auto' },
    header: { marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px' },

    addButton: {
        backgroundColor: 'var(--text-primary)', color: 'var(--bg-main)', border: 'none',
        padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem'
    },

    // Form ve Grid
    formBox: { backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid var(--border-light)', display: 'flex', gap: '10px' },
    input: { flex: 1, padding: '12px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', borderRadius: '6px', outline: 'none', fontFamily: 'var(--font-body)' },
    saveButton: { backgroundColor: 'var(--accent)', color: '#000', border: 'none', padding: '0 25px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    card: {
        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '20px',
        borderRadius: '8px', display: 'flex', gap: '20px', alignItems: 'start',
        cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    cardIcon: { fontSize: '1.8rem', color: 'var(--text-muted)', marginTop: '5px' },
    cardTitle: { margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: '600' },
    cardDesc: { margin: 0, fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: '1.5' },

    // İstatistik kutuları (Genel Bakış için)
    contentBox: { backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-subtle)' },
    statsGrid: { display: 'flex', gap: '20px', marginTop: '20px' },
    statCard: {
        backgroundColor: 'var(--bg-main)', padding: '25px', borderRadius: '8px', minWidth: '120px', textAlign: 'center',
        border: '1px solid var(--border-light)'
    }
};

export default UniverseDashboard;