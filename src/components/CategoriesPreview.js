import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db, collection, getDocs } from "../firebaseConfig";

const CategoriesPreview = () => {
  const [categories, setCategories] = useState([]);

  // Obtener categorías desde Firebase
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

        allPaintings.forEach(painting => {
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

  return (
    <section
      id="categories-carousel"
      className="py-3"
      style={{
        backgroundColor: "#f8f9fa",
        position: "relative",
      }}
    >
      <div className="container my-5 text-center">
      <h2 className="mb-3">Nuestras categorías</h2>

        <div className="mx-auto mb-4" style={{ width: '80px', height: '2px', background: '#e0a965' }} />

        <p
          className="text-center mb-4"
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            fontSize: "1.1rem",
            color: "#555",
          }}
        >
          Cada trazo cuenta una historia, cada obra abre una ventana a un
          universo único. Explora nuestras categorías y descubre el arte que
          conecta con tu espacio y tu esencia.
        </p>

        {/* 🎠 Carrusel con animación y gradientes */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            height: "320px",
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 20px",
            backgroundColor: "#f8f9fa",
          }}
        >
          {/* Gradiente izquierdo */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: "80px",
              background:
                "linear-gradient(to right, #f8f9fa 80%, rgba(248,249,250,0) 100%)",
              zIndex: 5,
              pointerEvents: "none",
            }}
          ></div>

          {/* Gradiente derecho */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              width: "80px",
              background:
                "linear-gradient(to left, #f8f9fa 80%, rgba(248,249,250,0) 100%)",
              zIndex: 5,
              pointerEvents: "none",
            }}
          ></div>

          {/* Carrusel animado */}
          <div
            className="scrolling-track"
            style={{
              display: "flex",
              width: "max-content",
              animation: "scrollLeft 30s linear infinite",
            }}
          >
            {[...categories, ...categories].map((category, index) => (
              <div
                key={`${category.name}-${index}`}
                style={{
                  width: "240px",
                  flexShrink: 0,
                  margin: "0 10px",
                }}
              >
                <Link
                  to={`/gallery?category=${encodeURIComponent(category.name)}`}
                  className="text-decoration-none"
                >
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      height: "280px",
                      padding: "16px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <img
                      src={category.image}
                      alt={category.name}
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                    <h3
                      style={{
                        textAlign: "center",
                        marginTop: "12px",
                        fontSize: "1.1rem",
                        color: "#333",
                        fontWeight: "500",
                      }}
                    >
                      {category.name}
                    </h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>
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
