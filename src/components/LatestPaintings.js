import React, { useState, useEffect } from "react";
import { db, collection, getDocs, query, orderBy, limit } from "../firebaseConfig";
import "bootstrap/dist/css/bootstrap.min.css";

import { useNavigate } from "react-router-dom";


const LatestPaintings = () => {
  const [paintings, setPaintings] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true); // inicia el fade out
  
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % paintings.length);
        setIsFading(false); // fade in del nuevo contenido
      }, 400); // dura lo mismo que el CSS transition
    }, 5000);
  
    return () => clearInterval(interval);
  }, [paintings]);  

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/gallery', { state: { paintingId: currentPainting.id } });
  };


  useEffect(() => {
    const fetchLatestPaintings = async () => {
      try {
        const q = query(collection(db, "paintings"), orderBy("timestamp", "desc"), limit(4));
        const querySnapshot = await getDocs(q);
        const latestPaintings = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPaintings(latestPaintings);
      } catch (error) {
        console.error("Error al obtener las últimas pinturas:", error);
      }
    };
    fetchLatestPaintings();
  }, []);

  /*
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % paintings.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [paintings]);
  */

  const currentPainting = paintings[currentIndex] || {};

  return (
    <section className="py-5" style={{ backgroundColor: '#f8f9fa', position: 'relative' }}>
      <div className="container">
        {paintings.length > 0 ? (
          <div
          className={`fade-wrapper ${isFading ? 'fade-out' : 'fade-in'}`}
          >
            <div className="row align-items-center">
              {/* Columna de texto */}
              <div className="col-md-5 mb-4 mb-md-0">
                <h2 style={{ 
                  fontSize: '1.8rem',
                  fontWeight: 300,
                  letterSpacing: '0.5px',
                  marginBottom: '1rem',
                  fontFamily: "'Playfair Display', serif"
                }}>
                  Últimas Obras
                </h2>
                
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 300,
                  marginBottom: '1rem',
                  lineHeight: 1.3,
                  fontFamily: "'Playfair Display', serif"
                }}>
                  {currentPainting.title}
                </h3>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ 
                    color: '#666',
                    fontSize: '1rem',
                    marginBottom: '0.3rem',
                    fontStyle: 'italic'
                  }}>
                    {currentPainting.category}
                  </p>
                  <p style={{ 
                    color: '#666',
                    fontSize: '1rem'
                  }}>
                    {currentPainting.size}
                  </p>
                </div>
              </div>

              {/* Columna de imagen con flechas */}
              <div className="col-md-7 position-relative">

                <div 
                onClick={handleClick}
                style={{
                  position: 'relative',
                  paddingTop: '75%',
                  backgroundColor: 'transparent',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}>
                    <img
                      src={currentPainting.images?.[0] || currentPainting.imageBase64}
                      alt={currentPainting.title}
                      style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        transition: 'transform 0.5s ease'
                      }}
                    />
                </div>
              </div>
            </div>

            {/* Puntos de navegación - Centrados en el pie */}
            <div className="row mt-3">
              <div className="col-12 d-flex justify-content-center">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {paintings.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      style={{
                        width: index === currentIndex ? '24px' : '12px',
                        height: '12px',
                        borderRadius: '6px',
                        backgroundColor: index === currentIndex ? '#d4af37' : '#ddd',
                        border: 'none',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted text-center py-4">No hay obras recientes</p>
        )}
      </div>
    </section>
  );
};

export default LatestPaintings;