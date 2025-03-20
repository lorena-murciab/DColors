import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css"; // Para los estilos personalizados
// import { collection, getDocs, db } from "../firebaseConfig"; // 🔹 Se comenta la importación de Firestore
import PaintingDetail from "./PaintingDetail"; // Detalles del cuadro
import UploadPaintingModal from "./UploadPaintingModal";


const Gallery = ({ /* user */ }) => { // 🔹 Se comenta la recepción del usuario
  // Estado de imágenes y filtros
  const [paintings, setPaintings] = useState([]); // Lista de cuadros
  const [filteredPaintings, setFilteredPaintings] = useState([]); // Cuadros filtrados
  const [category, setCategory] = useState("all"); // Categoría seleccionada
  const [selectedPainting, setSelectedPainting] = useState(null); // Cuadro seleccionado para ver detalles
  const [showUploadModal, setShowUploadModal] = useState(false);

  // 🔹 Se comenta la función que carga los cuadros desde Firestore
  /*
  useEffect(() => {
    const fetchPaintings = async () => {
      const querySnapshot = await getDocs(collection(db, "paintings"));
      const paintingsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPaintings(paintingsList);
      setFilteredPaintings(paintingsList);
    };
    fetchPaintings();
  }, []);
  */

  // Filtrar cuadros por categoría
  useEffect(() => {
    let filtered = paintings;
    if (category !== "all") {
      filtered = paintings.filter((painting) => painting.category === category);
    }
    setFilteredPaintings(filtered);
  }, [category, paintings]);

  return (
    <div className="container my-5">
      {/* Filtros */}
      <div className="d-flex justify-content-center align-items-center mb-4">
        <div>
          <button className="btn btn-outline-dark me-2" onClick={() => setCategory("all")}>
            Todos
          </button>
          <button className="btn btn-outline-dark me-2" onClick={() => setCategory("paisaje")}>
            Paisaje
          </button>
          <button className="btn btn-outline-dark me-2" onClick={() => setCategory("abstracto")}>
            Abstracto
          </button>
          <button className="btn btn-outline-dark me-2" onClick={() => setCategory("minimalista")}>
            Minimalista
          </button>
        </div>
      </div>

      {/* Galería */}
      <div className="row">
        {filteredPaintings.length > 0 ? (
          filteredPaintings.map((painting) => (
            <div key={painting.id} className="col-lg-4 col-md-6 mb-4">
              <div
                className="image-container shadow rounded"
                onClick={() => setSelectedPainting(painting)} // Abrir detalles al hacer clic
              >
                <img src={painting.imageBase64} className="w-100 rounded" alt={painting.title} />
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

      {/* Modal de detalles del cuadro */}
      {selectedPainting && (
        <PaintingDetail
          painting={selectedPainting}
          // user={user} // 🔹 Se comenta el usuario autenticado
          onClose={() => setSelectedPainting(null)} // Cerrar modal
        />
      )}

      {/* Modal de Subida de Cuadro */}
      {/* 🔹 Se desactiva la funcionalidad de subida de cuadros */}
      {/* 
      {showUploadModal && (
        <UploadPaintingModal
          onClose={() => setShowUploadModal(false)}
          onUpload={() => {
            setShowUploadModal(false);
            // Recargar la lista de cuadros después de subir uno nuevo
            const fetchPaintings = async () => {
              const querySnapshot = await getDocs(collection(db, "paintings"));
              const paintingsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
              setPaintings(paintingsList);
              setFilteredPaintings(paintingsList);
            };
            fetchPaintings();
          }}
        />
      )}
      */}
    </div>
  );
};

export default Gallery;
