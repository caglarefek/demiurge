import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

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
                    <NavButton label="🏠 Genel Bakış" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <NavButton label="👤 Karakterler" active={activeTab === 'character'} onClick={() => setActiveTab('character')} />
                    <NavButton label="🏰 Mekanlar" active={activeTab === 'location'} onClick={() => setActiveTab('location')} />
                    <NavButton label="📜 Lore & Tarih" active={activeTab === 'lore'} onClick={() => setActiveTab('lore')} />
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
                            {showForm ? 'İptal' : '+ Yeni Ekle'}
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
                                    {entity.type === 'character' ? '👤' : entity.type === 'location' ? '🏰' : '📜'}
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

// Yardımcı Bileşen: Menü Butonu
const NavButton = ({ label, active, onClick }) => (
    <div onClick={onClick} style={{
        ...styles.navItem,
        backgroundColor: active ? '#222' : 'transparent',
        color: active ? '#fff' : '#888',
        fontWeight: active ? 'bold' : 'normal'
    }}>
        {label}
    </div>
);

const styles = {
    container: { display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' },
    sidebar: { width: '240px', backgroundColor: '#111', borderRight: '1px solid #2a2a2a', padding: '20px', display: 'flex', flexDirection: 'column' },
    backArea: { marginBottom: '20px' },
    backLink: { color: '#666', textDecoration: 'none', fontSize: '0.9rem' },
    universeTitle: { color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '30px', paddingBottom: '10px', borderBottom: '1px solid #2a2a2a' },
    nav: { display: 'flex', flexDirection: 'column', gap: '5px' },
    navItem: { padding: '10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' },

    main: { flex: 1, padding: '50px', overflowY: 'auto', backgroundColor: '#0a0a0a' },
    header: { marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '20px' },
    addButton: { backgroundColor: '#ededed', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },

    formBox: { backgroundColor: '#111', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #333', display: 'flex', gap: '10px' },
    input: { flex: 1, padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: 'white', borderRadius: '4px' },
    saveButton: { backgroundColor: '#d4d4d4', border: 'none', padding: '0 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' },
    card: { backgroundColor: '#111', border: '1px solid #2a2a2a', padding: '15px', borderRadius: '6px', display: 'flex', gap: '15px', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s' },
    cardIcon: { fontSize: '1.5rem', opacity: 0.5 },
    cardTitle: { margin: '0 0 5px 0', color: '#eee' },
    cardDesc: { margin: 0, fontSize: '0.85rem', color: '#666' }
};

export default UniverseDashboard;