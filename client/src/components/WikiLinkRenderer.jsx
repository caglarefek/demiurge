import React from 'react';
import { Link, useParams } from 'react-router-dom';

// Bu fonksiyon metni tarar, [[Kelime]] yapılarını bulur ve Link'e çevirir
const WikiLinkRenderer = ({ text, entities }) => {
    if (!text) return null;

    // Regex: [[ ile başlayan ve ]] ile biten kelimeleri yakala
    const parts = text.split(/(\[\[.*?\]\])/g);

    return (
        <span>
      {parts.map((part, index) => {
          if (part.startsWith('[[') && part.endsWith(']]')) {
              // [[Gandalf]] -> Gandalf
              const cleanName = part.slice(2, -2);

              // Bu isme sahip varlığı bul (Büyük/küçük harf duyarsız)
              const targetEntity = entities.find(e => e.name.toLowerCase() === cleanName.toLowerCase());

              if (targetEntity) {
                  // Varlık bulunduysa Link ver
                  return (
                      <Link
                          key={index}
                          to={`/entity/${targetEntity._id}`}
                          style={{ color: '#d4d4d8', textDecoration: 'underline', fontWeight: 'bold' }}
                      >
                          {cleanName}
                      </Link>
                  );
              } else {
                  // Varlık yoksa kırmızı ve pasif göster (Böylece eksik olduğunu anlarsın)
                  return (
                      <span key={index} style={{ color: '#ef4444', opacity: 0.7, cursor: 'help' }} title="Böyle bir sayfa henüz yok">
                {cleanName}
              </span>
                  );
              }
          }
          // Normal metin
          return part;
      })}
    </span>
    );
};

export default WikiLinkRenderer;