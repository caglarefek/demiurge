import React from 'react';

function App() {
    return (
        <div style={styles.container}>

            {/* SOL MENÜ (SIDEBAR) */}
            <aside style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h1 style={styles.logo}>DEMIURGE</h1>
                    <span style={styles.version}>v0.1</span>
                </div>

                <nav style={styles.nav}>
                    <div style={styles.navItemActive}>🪐 Evrenler</div>
                    <div style={styles.navItem}>📜 Şablonlar</div>
                    <div style={styles.navItem}>⚙️ Ayarlar</div>
                </nav>
            </aside>

            {/* SAĞ İÇERİK ALANI (MAIN CONTENT) */}
            <main style={styles.main}>
                <header style={styles.header}>
                    <h2>Hoş Geldin, Mimar.</h2>
                    <p style={styles.subtext}>Bugün hangi gerçekliği inşa ediyoruz?</p>
                </header>

                {/* Burası ileride dinamik olacak */}
                <div style={styles.contentPlaceholder}>
                    <p>Henüz bir evren seçilmedi.</p>
                </div>
            </main>

        </div>
    );
}

// Javascript içinde CSS (Inline Styles)
// İleride bunları ayrı dosyalara taşıyacağız ama şimdilik hızlı görmek için burada tutuyoruz.
const styles = {
    container: {
        display: 'flex',
        height: '100vh', // Tam ekran yüksekliği
        width: '100vw',
        overflow: 'hidden'
    },
    sidebar: {
        width: '260px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px'
    },
    logoArea: {
        marginBottom: '40px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '20px'
    },
    logo: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        letterSpacing: '2px',
        margin: 0,
        color: 'var(--text-primary)'
    },
    version: {
        fontSize: '0.7rem',
        color: 'var(--text-secondary)',
        marginTop: '5px',
        display: 'block'
    },
    nav: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    navItem: {
        padding: '10px',
        borderRadius: '6px',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        transition: 'all 0.2s'
    },
    navItemActive: {
        padding: '10px',
        borderRadius: '6px',
        cursor: 'pointer',
        backgroundColor: '#222',
        color: 'var(--text-primary)',
        fontSize: '0.9rem',
        fontWeight: '500'
    },
    main: {
        flex: 1, // Kalan tüm alanı kapla
        padding: '40px',
        overflowY: 'auto' // İçerik taşarsa scroll olsun
    },
    header: {
        marginBottom: '40px'
    },
    subtext: {
        color: 'var(--text-secondary)',
        marginTop: '5px'
    },
    contentPlaceholder: {
        border: '1px dashed var(--border-color)',
        padding: '40px',
        borderRadius: '8px',
        textAlign: 'center',
        color: 'var(--text-secondary)'
    }
};

export default App;