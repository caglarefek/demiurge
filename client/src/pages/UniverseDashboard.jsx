// client/src/pages/UniverseDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { LuLayoutDashboard, LuUsers, LuMap, LuScroll, LuPlus, LuX, LuChevronLeft, LuSave } from "react-icons/lu";

function UniverseDashboard() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [universe, setUniverse] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [entities, setEntities] = useState([]); // Listelenecek varlıklar
    const [stats, setStats] = useState({ character: 0, location: 0, lore: 0 }); // İstatistikler
    const [templates, setTemplates] = useState([]);

    // Form State'leri
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');

    // Evren Açıklaması Düzenleme State'i
    const [universeDesc, setUniverseDesc] = useState('');
    const [isSavingDesc, setIsSavingDesc] = useState(false);

    // 1. Başlangıç Verilerini Çek
    useEffect(() => {
        // Evren Detayı
        fetch(`/api/universes/${id}`)
            .then(res => res.json())
            .then(data => {
                setUniverse(data);
                setUniverseDesc(data.description || '');
            });

        // Şablonlar
        fetch('/api/templates')
            .then(res => res.json())
            .then(data => setTemplates(data));

        // İstatistikler için TÜM varlıkları çekip sayalım
        fetch(`/api/entities?universeId=${id}`)
            .then(res => res.json())
            .then(allEntities => {
                // Genel Bakış için sayım yap
                const counts = { character: 0, location: 0, lore: 0 };
                allEntities.forEach(e => {
                    if (counts[e.type] !== undefined) counts[e.type]++;
                });
                setStats(counts);

                // Eğer 'overview' sekmesindeysek, son eklenenleri göstermek için listeyi de set edebiliriz
                // Ama şimdilik entities state'ini sadece diğer sekmelerde kullanacağız.
            });
    }, [id]);

    // 2. Sekme değişince ilgili varlıkları filtrele/çek
    useEffect(() => {
        if (activeTab === 'overview') return;
        fetch(`/api/entities?universeId=${id}&type=${activeTab}`)
            .then(res => res.json())
            .then(data => setEntities(data));
    }, [id, activeTab]);

    // Yeni Varlık Ekleme
    const handleCreateEntity = async (e) => {
        e.preventDefault();
        if (!newName) return;

        const response = await fetch('/api/entities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                universeId: id,
                type: activeTab,
                name: newName,
                description: newDesc,
                templateId: selectedTemplate || null
            })
        });

        if (response.ok) {
            const savedEntity = await response.json();
            setEntities([savedEntity, ...entities]);
            setNewName('');
            setNewDesc('');
            setSelectedTemplate('');
            setShowForm(false);
            // İstatistiği de artır (Manuel güncelliyoruz tekrar fetch atmamak için)
            setStats(prev => ({ ...prev, [activeTab]: prev[activeTab] + 1 }));
        }
    };

    // Evren Açıklamasını Kaydetme
    const handleSaveDescription = async () => {
        setIsSavingDesc(true);
        try {
            await fetch(`/api/universes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: universe.name, description: universeDesc })
            });
            // Küçük bir gecikme efekti
            setTimeout(() => setIsSavingDesc(false), 500);
        } catch (error) {
            console.error(error);
            setIsSavingDesc(false);
        }
    };

    const filteredTemplates = templates.filter(t => t.type === activeTab);

    if (!universe) return <div style={{padding:'40px', color:'white'}}>Yükleniyor...</div>;

    return (
        <div style={styles.container}>

            {/* --- SIDEBAR --- */}
            <aside style={styles.sidebar}>
                <div style={styles.backArea}>
                    <Link to="/" style={styles.backLink}><LuChevronLeft /> Evrenlere Dön</Link>
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
                <header style={styles.header}>
                    <h2>
                        {activeTab === 'overview' && 'GENEL BAKIŞ'}
                        {activeTab === 'character' && 'KARAKTERLER'}
                        {activeTab === 'location' && 'MEKANLAR'}
                        {activeTab === 'lore' && 'LORE & TARİH'}
                    </h2>

                    {activeTab !== 'overview' && (
                        <button style={styles.addButton} onClick={() => setShowForm(!showForm)}>
                            {showForm ? <><LuX size={18} /> İptal</> : <><LuPlus size={18} /> Yeni Ekle</>}
                        </button>
                    )}
                </header>

                {/* --- FORM ALANI (Sadece alt sekmelerde) --- */}
                {showForm && activeTab !== 'overview' && (
                    <form onSubmit={handleCreateEntity} style={styles.formBox}>
                        <div style={{display:'flex', flexDirection:'column', gap:'10px', flex: 1}}>
                            <input style={styles.input} placeholder="İsim..." value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
                            <input style={styles.input} placeholder="Kısa açıklama..." value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                        </div>
                        <div style={{display:'flex', flexDirection:'column', gap:'10px', width:'200px'}}>
                            <select style={styles.select} value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}>
                                <option value="">Şablon Seç (Opsiyonel)</option>
                                {filteredTemplates.map(t => (<option key={t._id} value={t._id}>{t.name}</option>))}
                            </select>
                            <button type="submit" style={styles.saveButton}>Kaydet</button>
                        </div>
                    </form>
                )}

                {/* --- GENEL BAKIŞ İÇERİĞİ --- */}
                {activeTab === 'overview' ? (
                    <div style={styles.overviewContainer}>

                        {/* İstatistik Kartları */}
                        <div style={styles.statsRow}>
                            <StatCard icon={<LuUsers />} count={stats.character} label="Karakter" />
                            <StatCard icon={<LuMap />} count={stats.location} label="Mekan" />
                            <StatCard icon={<LuScroll />} count={stats.lore} label="Lore Kaydı" />
                        </div>

                        {/* Evren Açıklaması / Not Alanı */}
                        <div style={styles.descSection}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                                <h3 style={{margin:0, fontSize:'1rem', color:'var(--text-muted)', letterSpacing:'1px'}}>EVREN NOTLARI</h3>
                                <button onClick={handleSaveDescription} style={styles.iconBtn} title="Kaydet">
                                    {isSavingDesc ? '...' : <LuSave size={18} />}
                                </button>
                            </div>
                            <textarea
                                style={styles.overviewTextarea}
                                value={universeDesc}
                                onChange={(e) => setUniverseDesc(e.target.value)}
                                placeholder="Bu evren hakkında genel notlar, hikaye özeti veya DM notlarını buraya alabilirsin..."
                            />
                        </div>

                    </div>
                ) : (
                    /* --- DİĞER SEKMELER (LİSTE) --- */
                    <div style={styles.grid}>
                        {entities.length === 0 && !showForm && <p style={{color:'var(--text-muted)'}}>Burada henüz hiç kayıt yok.</p>}
                        {entities.map(entity => (
                            <div key={entity._id} style={styles.card} onClick={() => navigate(`/entity/${entity._id}`)} role="button">
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

// Yardımcı Bileşenler
const NavButton = ({ label, icon, active, onClick }) => (
    <div onClick={onClick} style={{
        ...styles.navItem,
        backgroundColor: active ? 'var(--bg-card-hover)' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-body)',
        borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
    }}>
        <span style={{ fontSize: '1.2rem', display:'flex' }}>{icon}</span>
        <span>{label}</span>
    </div>
);

const StatCard = ({ icon, count, label }) => (
    <div style={styles.statCard}>
        <div style={styles.statIcon}>{icon}</div>
        <div style={styles.statInfo}>
            <span style={styles.statCount}>{count}</span>
            <span style={styles.statLabel}>{label}</span>
        </div>
    </div>
);

const styles = {
    container: { display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--bg-main)' },
    sidebar: { width: '260px', backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)', padding: '25px', display: 'flex', flexDirection: 'column' },
    backArea: { marginBottom: '30px' },
    backLink: { color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px', transition: 'color 0.2s' },
    universeTitle: { fontSize: '1.4rem', marginBottom: '40px', paddingBottom: '15px', borderBottom: '1px solid var(--border-subtle)', letterSpacing: '1px', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' },
    nav: { display: 'flex', flexDirection: 'column', gap: '8px' },
    navItem: { padding: '12px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' },

    main: { flex: 1, padding: '60px', overflowY: 'auto' },
    header: { marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px' },
    addButton: { backgroundColor: 'var(--text-primary)', color: 'var(--bg-main)', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' },

    formBox: { backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid var(--border-light)', display: 'flex', gap: '10px', alignItems:'flex-start' },
    input: { padding: '12px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', borderRadius: '6px', outline: 'none', fontFamily: 'var(--font-body)' },
    select: { padding: '12px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', borderRadius: '6px', outline: 'none', cursor: 'pointer' },
    saveButton: { backgroundColor: 'var(--accent)', color: '#000', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    card: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '20px', borderRadius: '8px', display: 'flex', gap: '20px', alignItems: 'start', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    cardIcon: { fontSize: '1.8rem', color: 'var(--text-muted)', marginTop: '5px' },
    cardTitle: { margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: '600', fontFamily: 'var(--font-heading)' },
    cardDesc: { margin: 0, fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: '1.5' },

    // --- GENEL BAKIŞ STİLLERİ ---
    overviewContainer: { display: 'flex', flexDirection: 'column', gap: '40px' },
    statsRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
    statCard: { flex: 1, minWidth: '150px', backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '15px' },
    statIcon: { fontSize: '2rem', color: 'var(--accent)', opacity: 0.8 },
    statInfo: { display: 'flex', flexDirection: 'column' },
    statCount: { fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1 },
    statLabel: { fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px' },

    descSection: { backgroundColor: 'var(--bg-card)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border-subtle)' },
    overviewTextarea: { width: '100%', minHeight: '200px', backgroundColor: 'transparent', border: 'none', color: 'var(--text-body)', fontSize: '1rem', lineHeight: '1.6', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)' },
    iconBtn: { background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem' }
};

export default UniverseDashboard;