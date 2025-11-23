import React, { useState, useEffect } from 'react';

function App() {
    const [universes, setUniverses] = useState([]); // Evren listesi
    const [newUniverseName, setNewUniverseName] = useState(''); // Yeni evren ismi inputu

    // Sayfa yüklenince evrenleri çek
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
        e.preventDefault(); // Sayfa yenilenmesini engelle
        if (!newUniverseName.trim()) return;

        try {
            const response = await fetch('/api/universes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newUniverseName })
            });

            if (response.ok) {
                setNewUniverseName(''); // Inputu temizle
                fetchUniverses(); // Listeyi güncelle
            }
        } catch (error) {
            console.error('Oluşturma hatası:', error);
        }
    };

    return (
        <div style={styles.container}>
            {/* --- SIDEBAR --- */}
            <aside style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h1 style={styles.logo}>DEMIURGE</h1>
                    <span style={styles.version}>v0.1</span>
                </div>
                <nav style={styles.nav}>
                    <div style={styles.navItemActive}>🪐 Evrenler</div>
                    <div style={styles.navItem}>📜 Şablonlar</div>
                </nav>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main style={styles.main}>
                <header style={styles.header}>
                    <h2>Evrenler</h2>
                    <p style={styles.subtext}>Yönettiğin gerçeklikler.</p>
                </header>

                {/* Yeni Evren Ekleme Formu */}
                <form onSubmit={handleCreateUniverse} style={styles.createForm}>
                    <input
                        type="text"
                        placeholder="Yeni bir evren adı gir..."
                        value={newUniverseName}
                        onChange={(e) => setNewUniverseName(e.target.value)}
                        style={styles.input}
                    />
                    <button type="submit" style={styles.button}>Oluştur</button>
                </form>

                {/* Evren Listesi Grid Yapısı */}
                <div style={styles.grid}>
                    {universes.map((universe) => (
                        <div key={universe._id} style={styles.card}>
                            <h3 style={styles.cardTitle}>{universe.name}</h3>
                            <p style={styles.cardDate}>
                                {new Date(universe.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                        </div>
                    ))}

                    {universes.length === 0 && (
                        <p style={{color: '#555'}}>Henüz hiç evren oluşturulmadı.</p>
                    )}
                </div>
            </main>
        </div>
    );
}

const styles = {
    container: { display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' },
    sidebar: { width: '260px', backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-color)', padding: '20px', display: 'flex', flexDirection: 'column' },
    logoArea: { marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' },
    logo: { fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px', margin: 0, color: 'var(--text-primary)' },
    version: { fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '5px' },
    nav: { display: 'flex', flexDirection: 'column', gap: '10px' },
    navItem: { padding: '10px', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-secondary)' },
    navItemActive: { padding: '10px', borderRadius: '6px', cursor: 'pointer', backgroundColor: '#222', color: 'var(--text-primary)', fontWeight: '500' },

    main: { flex: 1, padding: '40px', overflowY: 'auto' },
    header: { marginBottom: '30px' },
    subtext: { color: 'var(--text-secondary)', marginTop: '5px' },

    createForm: { display: 'flex', gap: '10px', marginBottom: '40px', maxWidth: '500px' },
    input: { flex: 1, padding: '12px', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: 'white', outline: 'none' },
    button: { padding: '12px 24px', backgroundColor: '#eee', color: 'black', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
    card: { backgroundColor: '#111', border: '1px solid #2a2a2a', padding: '20px', borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.2s' },
    cardTitle: { margin: '0 0 10px 0', color: '#d4d4d4' },
    cardDate: { fontSize: '0.8rem', color: '#666', margin: 0 }
};

export default App;