// client/src/pages/Home.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuOrbit, LuLayoutTemplate, LuPlus, LuCalendar, LuRocket, LuSettings, LuLibrary } from "react-icons/lu";

function Home() {
    const [universes, setUniverses] = useState([]);
    const [newUniverseName, setNewUniverseName] = useState('');
    const navigate = useNavigate();

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
        } catch (error) {
            console.error('Oluşturma hatası:', error);
        }
    };

    return (
        <div style={styles.container}>
            {/* --- SIDEBAR (YENİLENMİŞ YAPILANDIRMA) --- */}
            <aside style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h1 style={styles.logo}>DEMIURGE</h1>
                    <span style={styles.version}>v0.3</span>
                </div>

                {/* BÖLÜM 1: ÇALIŞMA ALANI */}
                <div style={styles.navSection}>
                    <span style={styles.navHeader}>ÇALIŞMA ALANI</span>
                    <div style={styles.navItemActive}>
                        <LuOrbit size={20} />
                        <span>Evrenler</span>
                    </div>
                </div>

                {/* AYIRAÇ */}
                <div style={styles.divider}></div>

                {/* BÖLÜM 2: SİSTEM & KÜTÜPHANE */}
                <div style={styles.navSection}>
                    <span style={styles.navHeader}>KÜTÜPHANE</span>

                    <div style={styles.navItem}>
                        <LuLayoutTemplate size={20} />
                        <span>Şablonlar</span>
                    </div>

                    <div style={styles.navItem}>
                        <LuLibrary size={20} />
                        <span>Varlık Kitaplığı</span>
                    </div>

                    <div style={styles.navItem}>
                        <LuSettings size={20} />
                        <span>Ayarlar</span>
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT (DASHBOARD) --- */}
            <main style={styles.main}>

                {/* VVD Tarzı Karşılama Başlığı */}
                <header style={styles.header}>
                    <h2>TEKRAR HOŞ GELDİN.</h2>
                    <p style={styles.subtext}>Bugün hangi gerçekliği şekillendireceksin?</p>
                </header>

                {/* Hızlı Oluşturma Alanı */}
                <div style={styles.actionArea}>
                    <form onSubmit={handleCreateUniverse} style={styles.createForm}>
                        <input
                            type="text"
                            placeholder="Yeni bir evren adı gir..."
                            value={newUniverseName}
                            onChange={(e) => setNewUniverseName(e.target.value)}
                            style={styles.input}
                            spellCheck="false"
                        />
                        <button type="submit" style={styles.button}>
                            <LuPlus size={18} /> Oluştur
                        </button>
                    </form>
                </div>

                {/* Son Çalışmalar Başlığı */}
                <h3 style={styles.sectionTitle}>SON ÇALIŞMALAR</h3>

                {/* Evren Listesi Grid Yapısı */}
                <div style={styles.grid}>
                    {universes.map((universe) => (
                        <div
                            key={universe._id}
                            style={styles.card}
                            onClick={() => navigate(`/universe/${universe._id}`)}
                            role="button"
                        >
                            {/* Kartın Solundaki İkon */}
                            <div style={styles.cardIconBox}>
                                <LuRocket size={24} color="var(--text-primary)" />
                            </div>

                            {/* Kart Bilgileri */}
                            <div style={{flex: 1}}>
                                <h3 style={styles.cardTitle}>{universe.name}</h3>
                                <div style={styles.cardMeta}>
                                    <LuCalendar size={12} />
                                    <span>Last edited: {new Date(universe.createdAt).toLocaleDateString('tr-TR')}</span>
                                </div>
                            </div>

                            {/* Kartın Sağındaki Ok (İsteğe bağlı) */}
                            <div style={{opacity: 0.3}}>→</div>
                        </div>
                    ))}

                    {universes.length === 0 && (
                        <div style={styles.emptyState}>
                            <LuOrbit size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                            <p>Henüz hiç evren oluşturulmadı.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

const styles = {
    container: { display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--bg-main)' },

    // Sidebar Tasarımı
    sidebar: { width: '280px', backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)', padding: '30px 20px', display: 'flex', flexDirection: 'column' },
    logoArea: { marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingLeft: '10px' },
    logo: { fontSize: '1.4rem', fontWeight: 'bold', letterSpacing: '4px', margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' },
    version: { fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '5px', display: 'block' },

    // Navigasyon Bölümleri
    navSection: { display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' },
    navHeader: { fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '10px', paddingLeft: '12px', marginTop: '10px' },
    divider: { height: '1px', backgroundColor: 'var(--border-subtle)', margin: '15px 0' },

    navItem: {
        padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-body)',
        fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s',
        fontWeight: '500'
    },
    navItemActive: {
        padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'var(--bg-card-hover)',
        color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '12px',
        fontWeight: 'bold'
    },

    // Main Content
    main: { flex: 1, padding: '60px 80px', overflowY: 'auto' },
    header: { marginBottom: '40px' },
    subtext: { color: 'var(--text-muted)', marginTop: '8px', fontSize: '1rem' },

    actionArea: { marginBottom: '50px' },
    createForm: { display: 'flex', gap: '15px', maxWidth: '600px' },
    input: { flex: 1, padding: '15px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '1rem' },
    button: { padding: '0 30px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-main)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' },

    sectionTitle: { fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '20px', fontWeight: '600' },

    // Grid & Cards
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
    card: {
        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '25px', borderRadius: '12px',
        cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', alignItems: 'center', gap: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
    },
    cardIconBox: { width: '56px', height: '56px', backgroundColor: 'var(--bg-main)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' },
    cardTitle: { margin: '0 0 6px 0', color: 'var(--text-primary)', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' },
    cardMeta: { fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' },

    emptyState: { color: 'var(--text-muted)', marginTop: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }
};

export default Home;