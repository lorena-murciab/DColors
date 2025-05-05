import React, { useState, useEffect } from "react";
import { Carousel } from "react-bootstrap";
import { FaPencilAlt } from "react-icons/fa";
import { onAuthStateChanged, auth } from "../firebaseConfig";
import EditPaintingModal from "./EditPaintingModal";

// import { FaWhatsapp } from "react-icons/fa";
import { FaTimes } from "react-icons/fa"; // Added for visible close icon

const PaintingDetail = ({ painting, onClose, onPaintingUpdated }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPainting, setCurrentPainting] = useState(painting);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  // Actualizar estado isMobile cuando cambia el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // Cerrar el modal de visualización al hacer clic fuera de él
  const handleClose = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Modal principal de visualización */}
      <div className="modal fade show" style={{ 
        display: "block", 
        backgroundColor: "rgba(0,0,0,0.9)",
        backdropFilter: "blur(8px)",
        zIndex: 1040
      }}
        onClick={handleClose}>
        <div className="modal-dialog modal-xl" style={{ maxWidth: isMobile ? "100vw" : "95vw", margin: isMobile ? "0" : "1.75rem auto" }}>
          <div className="modal-content border-0 bg-transparent">
            {/* Botón de cierre - Mejorado para móviles */}
            <button 
              onClick={onClose} 
              className={`position-absolute end-0 m-3 rounded-circle d-flex justify-content-center align-items-center ${isMobile ? 'btn btn-light' : 'btn-close bg-transparent p-2'}`}
              style={{ 
                zIndex: 1050,
                top: isMobile ? "10px" : "auto",
                width: isMobile ? "36px" : "auto",
                height: isMobile ? "36px" : "auto",
              }}
              aria-label="Close"
            >
              {isMobile && <FaTimes size={18} />}
            </button>

            {/* Contenido del modal de visualización */}
            <div className="modal-body p-0">
              <div className={`row g-0 ${isMobile ? 'flex-column' : ''}`}>
                {/* Galería de imágenes */}
                <div className={isMobile ? "col-12" : "col-lg-8"}>
                  {currentPainting.images?.length > 0 ? (
                    <Carousel controls={currentPainting.images?.length > 1}>
                      {currentPainting.images.map((img, index) => (
                        <Carousel.Item key={index}>
                          <img
                            src={img}
                            alt={`${currentPainting.title} - ${index + 1}`}
                            className="img-fluid w-100"
                            style={{ 
                              height: isMobile ? "50vh" : "80vh", 
                              objectFit: "contain" 
                            }}
                          />
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  ) : (
                    <div 
                      className="d-flex justify-content-center align-items-center bg-light" 
                      style={{ height: isMobile ? "50vh" : "85vh" }}
                    >
                      <div className="text-center text-muted">
                        <i className="bi bi-image fs-1"></i>
                        <p className="mt-2">No hay imágenes disponibles</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Detalles del cuadro */}
                <div className={isMobile ? "col-12" : "col-lg-4"} style={{ position: "relative" }}>
                  {isAdmin && (
                    <button 
                      onClick={() => setShowEditModal(true)}
                      className="btn btn-outline-dark position-absolute rounded-pill d-flex align-items-center gap-2"
                      style={{ 
                        zIndex: 10,
                        top: "1rem",
                        left: "1rem",
                      }}
                    >
                      <FaPencilAlt size={16}/>
                      <span>Editar</span>
                    </button>
                  )}
                  
                  <div 
                    className={`h-100 ${isMobile ? 'p-3' : 'p-4'} d-flex flex-column justify-content-${isMobile ? 'start' : 'center'}`} 
                    style={{ backgroundColor: "#f8f9fa" }}
                  >
                    <h1 className={`${isMobile ? 'fs-3' : 'display-5'} fw-light mb-${isMobile ? '3' : '4'} pb-${isMobile ? '1' : '2'}`}>
                      {currentPainting.title}
                    </h1>

                    <div className={`mb-${isMobile ? '2' : '3'}`}>
                      <h6 className="text-uppercase text-muted small mb-2">Autor</h6>
                      <p className={isMobile ? "fs-6" : "fs-5"}>{currentPainting.author || "—"}</p>
                    </div>
                  
                    <div className={`mb-${isMobile ? '3' : '4'}`}>
                      <h6 className="text-uppercase text-muted small mb-2">Categoría</h6>
                      <p className={isMobile ? "fs-6" : "fs-5"}>{currentPainting.category || "—"}</p>
                    </div>
                    
                    <div className={`mb-${isMobile ? '3' : '4'}`}>
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

                    <div className={`${isMobile ? 'flex-column' : 'd-flex justify-content-between'} align-items-start mb-${isMobile ? '3' : '4'} pt-${isMobile ? '1' : '2'}`}>
                    {/* Referencia */}
                    <div style={{ flex: 1, marginRight: isMobile ? '0' : '1rem', marginBottom: isMobile ? '1rem' : '0' }}>
                      <h6 className="text-uppercase text-muted small mb-2">Referencia</h6>
                      <p className="fs-7">{currentPainting.reference || "—"}</p>
                    </div>

                    {/* Puntos */}
                    {currentPainting.points && (
                      <div style={{ flex: 1 }}>
                        <h6 className="text-uppercase text-muted small mb-2">Puntos</h6>
                        <p className="fs-7">{currentPainting.points}</p>
                      </div>
                    )}
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


      {/* Botón flotante de WhatsApp */}
      {/*
      <a
        href={`https://wa.me/+34692688615?text=${encodeURIComponent(`Hola, estoy interesado en el cuadro "${currentPainting.title}" con referencia "${currentPainting.reference}.`)} `}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-success position-fixed d-flex align-items-center gap-2 shadow"
        style={{
          bottom: isMobile ? "1rem" : "2rem",
          right: isMobile ? "1rem" : "2rem",
          zIndex: 1050,
          borderRadius: "2rem",
          padding: isMobile ? "0.5rem 1rem" : "0.75rem 1.5rem",
          fontSize: isMobile ? "0.9rem" : "1rem"
        }}
      >
        <FaWhatsapp size={isMobile ? 18 : 20} />
        <span>{isMobile ? "Consultar" : "Contáctanos"}</span>
      </a> */}
    </>
  );
};

export default PaintingDetail;