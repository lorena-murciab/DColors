import React, { useState, useEffect } from "react";
import { db, collection, getDocs, query, orderBy, limit } from "../firebaseConfig";
import "bootstrap/dist/css/bootstrap.min.css";

const LatestPaintings = () => {
  const [paintings, setPaintings] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % paintings.length);
        setIsTransitioning(false);
      }, 500);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [paintings]);

  return (
    <section className="py-5 bg-light">
      <div className="container">
        {/* Título con subrayado elegante */}
        <div className="text-center mb-5">
          <h2 className="display-5 fw-light mb-3">Últimas Obras</h2>
          <div className="mx-auto" style={{ width: '80px', height: '2px', background: '#d4af37' }}></div>
        </div>

        {paintings.length > 0 ? (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {/* Tarjeta principal con transición */}
              <div 
                className={`card border-0 shadow-sm overflow-hidden mb-4 bg-white ${isTransitioning ? "opacity-0" : "opacity-100"}`}
                style={{ 
                  transition: 'opacity 0.5s ease',
                  borderRadius: '4px'
                }}
              >
                <div className="ratio ratio-4x3">
                  <img
                    src={paintings[currentIndex].imageBase64}
                    alt={paintings[currentIndex].title}
                    className="img-fluid p-3"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="card-body text-center">
                  <h3 className="h5 fw-normal mb-1">{paintings[currentIndex].title}</h3>
                  <p className="text-muted small mb-0">
                    <span>{paintings[currentIndex].category}</span>
                    <span className="mx-2">•</span>
                    <span>{paintings[currentIndex].size}</span>
                  </p>
                </div>
              </div>

              {/* Miniaturas */}
              <div className="d-flex justify-content-center gap-3">
                {paintings.map((painting, index) => (
                  <div
                    key={painting.id}
                    className={`cursor-pointer ${index === currentIndex ? "border-bottom border-3 border-gold" : ""}`}
                    style={{
                      width: '60px',
                      height: '60px',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => {
                      setIsTransitioning(true);
                      setTimeout(() => {
                        setCurrentIndex(index);
                        setIsTransitioning(false);
                      }, 500);
                    }}
                  >
                    <img
                      src={painting.imageBase64}
                      alt={painting.title}
                      className="img-fluid h-100 w-100 object-fit-cover"
                      style={{
                        opacity: index === currentIndex ? 1 : 0.7,
                        transition: 'opacity 0.3s ease'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted">No hay obras recientes</p>
        )}
      </div>
    </section>
  );
};

export default LatestPaintings;