import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css"; // Estilos personalizados
import { db, collection, getDocs } from "../firebaseConfig";
import PaintingDetail from "./PaintingDetail";

const Gallery = () => {
  const [paintings, setPaintings] = useState([]);
  const [filteredPaintings, setFilteredPaintings] = useState([]);
  const [category, setCategory] = useState("all");
  const [selectedPainting, setSelectedPainting] = useState(null);

  // 🔹 Cargar cuadros desde Firestore
  useEffect(() => {
    const fetchPaintings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "paintings"));
        const paintingsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPaintings(paintingsList);
        setFilteredPaintings(paintingsList);
      } catch (error) {
        console.error("Error al cargar los cuadros:", error);
      }
    };
    fetchPaintings();
  }, []);

  // 🔹 Filtrar cuadros por categoría
  useEffect(() => {
    if (category === "all") {
      setFilteredPaintings(paintings);
    } else {
      setFilteredPaintings(paintings.filter((painting) => painting.category === category));
    }
  }, [category, paintings]);

  return (
    <div className="container my-5">
      {/* 🔹 Filtros por categoría */}
      <div className="d-flex justify-content-center align-items-center mb-4">
        {["all", "paisaje", "abstracto", "minimalista"].map((cat) => (
          <button key={cat} className="btn btn-outline-dark me-2" onClick={() => setCategory(cat)}>
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
                  src={painting.imageBase64}
                  className="w-100 rounded"
                  alt={painting.title}
                  style={{ objectFit: "cover", height: "250px" }}
                />
                <div className="overlay">
                  <p className="size">{painting.size}</p>
                  <p className="category">{painting.category}</p>
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
