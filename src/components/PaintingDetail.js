import React, { useState, useEffect } from "react";
import { Carousel } from "react-bootstrap";
import { FaPencilAlt } from "react-icons/fa";
import { onAuthStateChanged, auth } from "../firebaseConfig"; // Ajusta la ruta según tu estructura


const PaintingDetail = ({ painting, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editedPainting, setEditedPainting] = useState({ 
    ...painting,
    sizes: painting.sizes ? [...painting.sizes] : [],
    customSize: ""
  });
  const [validationErrors, setValidationErrors] = useState({
    title: false,
    reference: false,
    images: false,
    sizes: false
  });

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user); // Convierte a booleano - true si hay usuario, false si no
      console.log("Usuario autenticado:", user?.email);
    });

    return () => unsubscribe(); // Limpieza al desmontar
  }, []);

  const PREDEFINED_SIZES = [
    "150 x 50 cm", "100 x 80 cm", "70 x 140 cm", "100 x 130 cm",
    "100 x 150 cm", "100 x 200 cm", "120 x 120 cm", "120 x 150 cm", "60 x 60 cm",
  ];

  // Funciones para manejar tamaños
  const handleSizeToggle = (size) => {
    setEditedPainting(prev => {
      const newSizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      
      if (validationErrors.sizes && newSizes.length > 0) {
        setValidationErrors(prev => ({...prev, sizes: false}));
      }
      
      return {...prev, sizes: newSizes};
    });
  };

  const handleAddCustomSize = () => {
    if (editedPainting.customSize && !editedPainting.sizes.includes(editedPainting.customSize)) {
      setEditedPainting(prev => ({
        ...prev,
        sizes: [...prev.sizes, prev.customSize],
        customSize: ""
      }));
      setValidationErrors(prev => ({...prev, sizes: false}));
    }
  };

  // Función para guardar cambios
  const handleSave = () => {
    const errors = {
      title: !editedPainting.title.trim(),
      reference: !editedPainting.reference.trim(),
      sizes: editedPainting.sizes.length === 0,
      images: editedPainting.images.length === 0
    };
    
    setValidationErrors(errors);
    
    if (Object.values(errors).some(error => error)) {
      return;
    }

    onSave(editedPainting);
    setIsEditing(false);
  };

  return (
    <div className="modal fade show" style={{ 
      display: "block", 
      backgroundColor: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(5px)"
    }}>
      <div className="modal-dialog modal-xl" style={{ maxWidth: "95vw" }}>
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-light border-0">
            <div className="d-flex justify-content-between w-100 align-items-center">
              {isEditing ? (
                <input
                  type="text"
                  value={editedPainting.title}
                  onChange={(e) => setEditedPainting({...editedPainting, title: e.target.value})}
                  className={`form-control form-control-lg border-0 shadow-none fs-3 fw-bold ${validationErrors.title ? 'is-invalid' : ''}`}
                  placeholder="Título del cuadro*"
                  style={{ backgroundColor: "transparent" }}
                />
              ) : (
                <h2 className="modal-title fw-bold mb-0">{painting.title}</h2>
              )}
              <button 
                onClick={onClose} 
                className="btn-close"
                aria-label="Close"
              ></button>
            </div>
          </div>
          
          <div className="modal-body p-4">
            <div className="row g-4">
              {/* Galería de imágenes */}
              <div className="col-lg-7">
                <div className="rounded-4 overflow-hidden shadow-lg bg-dark">
                  {editedPainting.images?.length > 0 ? (
                    <Carousel 
                      indicators={editedPainting.images.length > 1}
                      controls={editedPainting.images.length > 1}
                      interval={null}
                    >
                      {editedPainting.images.map((img, index) => (
                        <Carousel.Item key={index}>
                          <div 
                            className="d-flex justify-content-center align-items-center" 
                            style={{ height: "70vh", backgroundColor: "#f8f9fa" }}
                          >
                            <img
                              src={img}
                              alt={`${editedPainting.title} - ${index + 1}`}
                              className="img-fluid"
                              style={{ 
                                maxHeight: "100%", 
                                maxWidth: "100%", 
                                objectFit: "contain" 
                              }}
                            />
                          </div>
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  ) : (
                    <div 
                      className="d-flex justify-content-center align-items-center text-white" 
                      style={{ height: "70vh" }}
                    >
                      <div className="text-center">
                        <i className="bi bi-image fs-1"></i>
                        <p className="mt-2">No hay imágenes disponibles</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Detalles del cuadro */}
              <div className="col-lg-5">
                <div className="sticky-top" style={{ top: "20px" }}>
                  {isEditing ? (
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="mb-4">
                          <label className="form-label fw-bold text-muted small">REFERENCIA*</label>
                          <input
                            type="text"
                            value={editedPainting.reference}
                            onChange={(e) => setEditedPainting({...editedPainting, reference: e.target.value})}
                            className={`form-control ${validationErrors.reference ? 'is-invalid' : ''}`}
                            placeholder="Código de referencia"
                          />
                          {validationErrors.reference && (
                            <div className="invalid-feedback">La referencia es obligatoria</div>
                          )}
                        </div>
                        
                        <div className="mb-4">
                          <label className="form-label fw-bold text-muted small">CATEGORÍA</label>
                          <input
                            type="text"
                            value={editedPainting.category}
                            onChange={(e) => setEditedPainting({...editedPainting, category: e.target.value})}
                            className="form-control"
                            placeholder="Ej: Abstracto, Retrato..."
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="form-label fw-bold text-muted small">TAMAÑOS DISPONIBLES*</label>
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            {PREDEFINED_SIZES.map(size => (
                              <button
                                key={size}
                                type="button"
                                className={`btn btn-sm ${editedPainting.sizes.includes(size) ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => handleSizeToggle(size)}
                                style={{ minWidth: "120px" }}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                          
                          <div className="input-group">
                            <input
                              type="text"
                              placeholder="Añadir tamaño personalizado"
                              value={editedPainting.customSize}
                              onChange={(e) => setEditedPainting({...editedPainting, customSize: e.target.value})}
                              className="form-control"
                            />
                            <button 
                              className="btn btn-outline-secondary" 
                              type="button"
                              onClick={handleAddCustomSize}
                            >
                              <i className="bi bi-plus-lg"></i>
                            </button>
                          </div>
                          {validationErrors.sizes && (
                            <div className="text-danger small mt-2">Selecciona al menos un tamaño</div>
                          )}
                          
                          {editedPainting.sizes.length > 0 && (
                            <div className="mt-3">
                              <div className="d-flex flex-wrap gap-2">
                                {editedPainting.sizes.map((size, i) => (
                                  <span key={i} className="badge bg-primary d-flex align-items-center">
                                    {size}
                                    <button 
                                      type="button" 
                                      className="btn-close btn-close-white ms-2" 
                                      style={{ fontSize: "0.5rem" }}
                                      onClick={() => handleSizeToggle(size)}
                                    ></button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="d-flex gap-3 pt-3 border-top">
                          <button 
                            onClick={() => {
                              setIsEditing(false);
                              setEditedPainting({...painting, sizes: [...painting.sizes], customSize: ""});
                              setValidationErrors({
                                title: false,
                                reference: false,
                                sizes: false,
                                images: false
                              });
                            }} 
                            className="btn btn-outline-secondary flex-grow-1"
                          >
                            Cancelar
                          </button>
                          <button 
                            onClick={handleSave} 
                            className="btn btn-primary flex-grow-1"
                          >
                            Guardar cambios
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="mb-4">
                          <h6 className="text-muted small fw-bold">REFERENCIA</h6>
                          <p className="fs-5">{painting.reference || "Sin referencia"}</p>
                        </div>
                        
                        <div className="mb-4">
                          <h6 className="text-muted small fw-bold">CATEGORÍA</h6>
                          <p className="fs-5">{painting.category || "Sin categoría"}</p>
                        </div>
                        
                        <div className="mb-4">
                          <h6 className="text-muted small fw-bold">TAMAÑOS DISPONIBLES</h6>
                          <div className="d-flex flex-wrap gap-2">
                            {painting.sizes?.length > 0 ? (
                              painting.sizes.map((size, i) => (
                                <span key={i} className="badge bg-primary">{size}</span>
                              ))
                            ) : (
                              <span className="text-muted">No hay tamaños especificados</span>
                            )}
                          </div>
                        </div>
                        
                        {isAdmin && (
                          <button 
                          onClick={() => setIsEditing(true)} 
                          className="btn btn-outline-primary w-100 mt-4 d-flex align-items-center justify-content-center gap-2"
                        >
                          <FaPencilAlt size={16} className="me-2" />
                          Editar detalles
                        </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaintingDetail;