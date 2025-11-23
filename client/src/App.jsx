import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import UniverseDashboard from './pages/UniverseDashboard';
import EntityEditor from './pages/EntityEditor';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Ana Sayfa */}
                <Route path="/" element={<Home />} />

                {/* Evren Detay Sayfası (Dinamik ID ile) */}
                <Route path="/universe/:id" element={<UniverseDashboard />} />
                <Route path="/entity/:id" element={<EntityEditor />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;