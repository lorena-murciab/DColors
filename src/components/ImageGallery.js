import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css"; // Estilos personalizados
import { db, collection, getDocs } from "../firebaseConfig";
import PaintingDetail from "./PaintingDetail";

const Gallery = () => {
  const [paintings, setPaintings] = useState([]);
  const [filteredPaintings, setFilteredPaintings] = useState([]);
  const [categories, setCategories] = useState(["all"]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPainting, setSelectedPainting] = useState(null);

  // 🔹 Cargar cuadros desde Firestore
  useEffect(() => {
    const fetchPaintings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "paintings"));
        const paintingsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPaintings(paintingsList);
        setFilteredPaintings(paintingsList);
        
        // Extraer categorías únicas de los cuadros
        const uniqueCategories = [...new Set(paintingsList.map(p => p.category))];
        setCategories(["all", ...uniqueCategories.filter(c => c && c !== "Sin categoría")]);
      } catch (error) {
        console.error("Error al cargar los cuadros:", error);
      }
    };
    fetchPaintings();
  }, []);

  // 🔹 Filtrar cuadros por categoría
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredPaintings(paintings);
    } else {
      setFilteredPaintings(paintings.filter((painting) => painting.category === selectedCategory));
    }
  }, [selectedCategory, paintings]);

  // Función para obtener la primera imagen de un cuadro
  const getMainImage = (painting) => {
    return painting.images && painting.images.length > 0 
      ? painting.images[0] 
      : 'https://via.placeholder.com/300x250?text=No+imagen';
  };

  return (
    <div className="container my-5">
      {/* 🔹 Filtros por categoría */}
      <div className="d-flex justify-content-center align-items-center mb-4 flex-wrap">
        {categories.map((cat) => (
          <button 
            key={cat} 
            className={`btn ${selectedCategory === cat ? 'btn-dark' : 'btn-outline-dark'} me-2 mb-2`} 
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === "all" ? "Todos" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* 🔹 Galería de cuadros */}
      <div className="row">
        {filteredPaintings.length > 0 ? (
          filteredPaintings.map((painting) => (
            <div key={painting.id} className="col-lg-4 col-md-6 mb-4">
              <div
                className="image-container shadow rounded"
                onClick={() => setSelectedPainting(painting)}
              >
                <img
                  src={getMainImage(painting)}
                  className="w-100 rounded"
                  alt={painting.title}
                  style={{ objectFit: "cover", height: "250px" }}
                />
                <div className="overlay p-3">
                  <h5 className="title mb-1">{painting.title}</h5>
                  <div className="d-flex justify-content-between">
                    <div>
                      <p className="category mb-1">{painting.category}</p>
                      <p className="size mb-0">{painting.size}</p>
                    </div>
                    {painting.reference && (
                      <p className="reference badge bg-light text-dark">Ref: {painting.reference}</p>
                    )}
                  </div>
                  {painting.images && painting.images.length > 1 && (
                    <div className="position-absolute bottom-0 end-0 m-2">
                      <span className="badge bg-dark">+{painting.images.length - 1}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">No hay obras en esta categoría.</p>
        )}
      </div>

      {/* 🔹 Modal de detalles del cuadro */}
      {selectedPainting && (
        <PaintingDetail painting={selectedPainting} onClose={() => setSelectedPainting(null)} />
      )}
    </div>
  );
};

export default Gallery;