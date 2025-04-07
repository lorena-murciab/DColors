import React, { useState, useEffect } from "react";
import { Carousel } from "react-bootstrap";
import { FaPencilAlt } from "react-icons/fa";
import { onAuthStateChanged, auth } from "../firebaseConfig";
import EditPaintingModal from "./EditPaintingModal"; // Importar el modal de edición

const PaintingDetail = ({ painting, onClose, onPaintingUpdated }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPainting, setCurrentPainting] = useState(painting);

  // Sincronizar cuando el prop painting cambie
  useEffect(() => {
    setCurrentPainting(painting);
  }, [painting]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveSuccess = (updatedPainting) => {
    // Actualizar el estado local primero
    setCurrentPainting(updatedPainting);
    
    // Notificar al componente padre (Gallery) sobre la actualización
    if (onPaintingUpdated) {
      onPaintingUpdated(updatedPainting);
    }
    
    // Luego cerrar el modal de edición
    setShowEditModal(false);
  };

  return (
    <>
      {/* Modal principal de visualización */}
      <div className="modal fade show" style={{ 
        display: "block", 
        backgroundColor: "rgba(0,0,0,0.9)",
        backdropFilter: "blur(8px)",
        zIndex: 1040
      }}>
        <div className="modal-dialog modal-xl" style={{ maxWidth: "95vw" }}>
          <div className="modal-content border-0 bg-transparent">
            {/* Botón de cierre */}
            <button 
              onClick={onClose} 
              className="btn-close position-absolute end-0 m-3 bg-transparent rounded-circle p-2"
              style={{ zIndex: 10 }}
              aria-label="Close"
            ></button>

            {/* Contenido del modal de visualización */}
          <div className="modal-body p-0">
            <div className="row g-0">
              {/* Galería de imágenes */}
              <div className="col-lg-8">
              {currentPainting.images?.length > 0 ? (
                    <Carousel>
                    {currentPainting.images.map((img, index) => (
                      <Carousel.Item key={index}>
                        <img
                          src={img}
                          alt={`${currentPainting.title} - ${index + 1}`}
                          className="img-fluid w-100"
                          style={{ height: "80vh", objectFit: "contain" }}
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  <div 
                    className="d-flex justify-content-center align-items-center bg-light" 
                    style={{ height: "85vh" }}
                  >
                    <div className="text-center text-muted">
                      <i className="bi bi-image fs-1"></i>
                      <p className="mt-2">No hay imágenes disponibles</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Detalles del cuadro */}
              <div className="col-lg-4 position-relative">
                {isAdmin && (
                  <button 
                    onClick={() => setShowEditModal(true)}
                    className="btn btn-outline-dark position-absolute rounded-pill d-flex align-items-center gap-2"
                    style={{ zIndex: 10,
                      top: "1rem",
                      left: "1rem",
                     }}
                  >
                    <FaPencilAlt size={16}/>
                    <span>Editar</span>
                  </button>
                )}
                
                <div 
                  className="h-100 p-4 d-flex flex-column justify-content-center" 
                  style={{ backgroundColor: "#f8f9fa" }}
                >
                  <h1 className="display-5 fw-light mb-4 pb-2">{currentPainting.title}</h1>

                  <div className="mb-3">
                      <h6 className="text-uppercase text-muted small mb-2">Autor</h6>
                      <p className="fs-5">{currentPainting.author || "—"}</p>
                    </div>
                  
                  <div className="mb-4">
                    <h6 className="text-uppercase text-muted small mb-2">Categoría</h6>
                    <p className="fs-5">{currentPainting.category || "—"}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h6 className="text-uppercase text-muted small mb-2">Tamaños disponibles</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {currentPainting.sizes?.length > 0 ? (
                        currentPainting.sizes.map((size, i) => (
                          <span key={i} className="badge bg-dark bg-opacity-10 text-dark rounded-pill px-3 py-2">
                            {size}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4 pt-2">
                    <h6 className="text-uppercase text-muted small mb-2">Referencia</h6>
                    <p className="fs-7">{currentPainting.reference || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      {/* Modal de edición */}
      {showEditModal && (
        <EditPaintingModal
          painting={currentPainting}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveSuccess}
        />
      )}
    </>
  );
};

export default PaintingDetail;