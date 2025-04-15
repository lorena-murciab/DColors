import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { db, collection, getDocs } from "../firebaseConfig";

const CategoriesPreview = () => {
  const [categories, setCategories] = useState([]);
  const carouselRef = useRef(null);

  // 1. Obtener categorías desde Firebase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "paintings"));
        const allPaintings = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const uniqueCategories = [];
        const seenCategories = new Set();

        allPaintings.forEach((painting) => {
          if (painting.category && !seenCategories.has(painting.category)) {
            seenCategories.add(painting.category);
            uniqueCategories.push({
              name: painting.category,
              image: painting.images?.[0] || painting.imageBase64,
            });
          }
        });

        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };

    fetchCategories();
  }, []);

  // 2. Carrusel automático infinito (sin interacción de arrastre)
  useEffect(() => {
    if (!carouselRef.current || categories.length === 0) return;

    const carousel = carouselRef.current;
    let animationId;
    const speed = 1; // Velocidad de desplazamiento

    const animate = () => {
      if (carousel.scrollLeft >= carousel.scrollWidth / 2) {
        carousel.scrollLeft = 0; // Reinicia al llegar a la mitad
      } else {
        carousel.scrollLeft += speed;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [categories]);

  return (
    <section id="categories-carousel" className="py-5" style={{ 
      backgroundColor: '#f8f9fa', 
      position: 'relative'
    }}>
      <div className="container" style={{ position: 'relative' }}>
        <h2 className="text-center mb-4" style={{ 
          fontSize: '2rem',
          fontFamily: "'Playfair Display', serif",
          color: '#333'
        }}>
          Nuestras categorías
        </h2>

        {/* Contenedor del carrusel con efecto fade */}
        <div style={{ position: 'relative', padding: '0 40px' }}>
          {/* Gradiente izquierdo */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '100px',
            background: 'linear-gradient(90deg, rgba(248,249,250,1) 0%, rgba(248,249,250,0) 100%)',
            zIndex: 2,
            pointerEvents: 'none'
          }}></div>

          {/* Carrusel (sin eventos de arrastre) */}
          <div
            ref={carouselRef}
            style={{ 
              height: '320px',
              overflowX: 'hidden',
              display: 'flex',
              scrollBehavior: 'smooth'
            }}
          >
            {/* Contenido duplicado para efecto infinito */}
            {[...categories, ...categories].map((category, index) => (
              <div 
                key={`${category.name}-${index}`} 
                style={{ 
                  width: '260px',
                  flexShrink: 0,
                  margin: '0 10px'
                }}
              >
                <Link 
                  to={`/gallery?category=${encodeURIComponent(category.name)}`} 
                  className="text-decoration-none"
                >
                  <div style={{ 
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    height: '280px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <img
                      src={category.image}
                      alt={category.name}
                      style={{ 
                        width: '100%',
                        height: '180px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                    <h3 style={{ 
                      textAlign: 'center',
                      marginTop: '12px',
                      fontSize: '1.1rem',
                      color: '#333',
                      fontWeight: '500'
                    }}>
                      {category.name}
                    </h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Gradiente derecho */}
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '100px',
            background: 'linear-gradient(270deg, rgba(248,249,250,1) 0%, rgba(248,249,250,0) 100%)',
            zIndex: 2,
            pointerEvents: 'none'
          }}></div>
        </div>

        <div className="text-center mt-4">
          <Link to="/gallery" className="btn btn-dark px-4 py-2">
            Ver todas las categorías
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoriesPreview;