import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EntityEditor() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [entity, setEntity] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Veriyi Çek
    useEffect(() => {
        fetch(`/api/entities/${id}`)
            .then(res => res.json())
            .then(data => {
                setEntity(data);
                setName(data.name);
                setDescription(data.description);
            });
    }, [id]);

    // Kaydetme İşlemi
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await fetch(`/api/entities/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description })
            });
            // Kaydettikten sonra geri dönelim mi? Hayır, yazmaya devam edebilirsin.
            // Sadece kullanıcıya hissettirelim (butonda yazar).
            setTimeout(() => setIsSaving(false), 500);
        } catch (error) {
            console.error('Hata:', error);
            setIsSaving(false);
        }
    };

    if (!entity) return <div style={{padding:'40px', color:'white'}}>Yükleniyor...</div>;

    return (
        <div style={styles.container}>

            {/* Üst Bar */}
            <header style={styles.header}>
                <button onClick={() => navigate(-1)} style={styles.backButton}>← Geri</button>
                <span style={styles.typeTag}>{entity.type.toUpperCase()}</span>
                <button onClick={handleSave} style={styles.saveButton}>
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </header>

            {/* Editör Alanı */}
            <div style={styles.editorArea}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.titleInput}
                    placeholder="İsimsiz Varlık"
                />

                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={styles.descInput}
                    placeholder="Hikayeni buraya yaz..."
                />
            </div>

        </div>
    );
}

const styles = {
    container: { height: '100vh', backgroundColor: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    header: { width: '100%', maxWidth: '800px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222' },
    backButton: { background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1rem' },
    saveButton: { backgroundColor: '#ededed', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    typeTag: { fontSize: '0.8rem', letterSpacing: '2px', color: '#444' },

    editorArea: { flex: 1, width: '100%', maxWidth: '800px', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '20px' },
    titleInput: { backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: '2.5rem', fontWeight: 'bold', outline: 'none', width: '100%' },
    descInput: { flex: 1, backgroundColor: 'transparent', border: 'none', color: '#ccc', fontSize: '1.1rem', lineHeight: '1.6', outline: 'none', resize: 'none', fontFamily: 'inherit' }
};

export default EntityEditor;