import React, { useState } from "react";
import { Modal, Button, Alert, Form } from "react-bootstrap";
import { FaCheck, FaTimes, FaPlus } from "react-icons/fa";
import { db, doc, updateDoc, serverTimestamp } from "../firebaseConfig";

const EditPaintingModal = ({ painting, onClose, onSave, onSaveSuccess }) => {
  // Estados del formulario
  const [editedPainting, setEditedPainting] = useState({
    title: painting.title || "",
    category: painting.category || "",
    sizes: painting.sizes ? [...painting.sizes] : [],
    reference: painting.reference || "",
    images: painting.images || [],
    customSize: ""
  });

  // Estados de UI
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({
    title: false,
    reference: false,
    sizes: false,
    images: false, 
    category: false
  });

  // Tamaños predefinidos
  const PREDEFINED_SIZES = [
    "150 x 50 cm", "100 x 80 cm", "70 x 140 cm",
    "100 x 130 cm", "100 x 150 cm", "100 x 200 cm",
    "120 x 120 cm", "120 x 150 cm", "60 x 60 cm"
  ];

  // Manejar cambio de tamaño
  const handleSizeToggle = (size) => {
    setEditedPainting(prev => {
      const newSizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      
      // Limpiar error de validación si se selecciona un tamaño
      if (validationErrors.sizes && newSizes.length > 0) {
        setValidationErrors(prev => ({...prev, sizes: false}));
      }
      
      return {...prev, sizes: newSizes};
    });
  };

  // Añadir tamaño personalizado
  const handleAddCustomSize = () => {
    if (editedPainting.customSize.trim() && !editedPainting.sizes.includes(editedPainting.customSize)) {
      setEditedPainting(prev => ({
        ...prev,
        sizes: [...prev.sizes, prev.customSize.trim()],
        customSize: ""
      }));
      setValidationErrors(prev => ({...prev, sizes: false}));
    }
  };

  // Validar todos los campos
  const validateForm = () => {
    const errors = {
      title: !editedPainting.title.trim(),
      reference: !editedPainting.reference.trim(),
      sizes: editedPainting.sizes.length === 0,
      images: editedPainting.images.length === 0,
        category: !editedPainting.category.trim()
    };
    
    setValidationErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  // Guardar cambios
  const handleSave = async () => {
    setError(null);
    
    // Validar antes de guardar
    if (!validateForm()) {
      setError("Por favor completa todos los campos obligatorios");
      return;
    }

    setIsSaving(true);

    try {
      // Preparar datos para Firebase
      const paintingData = {
        title: editedPainting.title.trim(),
        category: editedPainting.category.trim(),
        sizes: editedPainting.sizes.filter(size => size.trim() !== ""),
        reference: editedPainting.reference.trim(),
        images: editedPainting.images,
        timestamp: serverTimestamp()
      };

      // Primero actualizamos Firebase
      await updateDoc(doc(db, "paintings", painting.id), paintingData);

      // Llama a onSave (no onSaveSuccess)
      if (onSave) {
        onSave({ 
          ...painting,
          ...paintingData
        });
      }

      // Finalmente cerramos el modal
      onClose();

    } catch (err) {
      console.error("Error al guardar:", err);
      setError("Error al guardar los cambios. Por favor intenta nuevamente.");

    // Fallback: actualización local si falla Firebase
      const updatedPainting = {
        ...painting,
        title: editedPainting.title.trim(),
        category: editedPainting.category.trim(),
        sizes: editedPainting.sizes.filter(size => size.trim() !== ""),
        reference: editedPainting.reference.trim(),
        images: editedPainting.images
      };
      onSaveSuccess(updatedPainting);

    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal show={true} onHide={onClose} size="lg" centered backdrop="static">
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">Editar Cuadro</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* Mensaje de error general */}
        {error && (
          <Alert variant="danger" className="rounded-0 border-0 border-start border-5 border-danger">
            <div className="d-flex align-items-center">
              <FaTimes className="me-2" />
              <span>{error}</span>
            </div>
          </Alert>
        )}

        <Form>
          {/* Campo Título */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Título*</Form.Label>
            <Form.Control
              type="text"
              value={editedPainting.title}
              onChange={(e) => {
                setEditedPainting({...editedPainting, title: e.target.value});
                if (validationErrors.title) {
                  setValidationErrors({...validationErrors, title: false});
                }
              }}
              isInvalid={validationErrors.title}
              className="py-2"
            />
            <Form.Control.Feedback type="invalid">
              El título es obligatorio
            </Form.Control.Feedback>
          </Form.Group>

          {/* Campo Referencia */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Referencia*</Form.Label>
            <Form.Control
              type="text"
              value={editedPainting.reference}
              onChange={(e) => {
                setEditedPainting({...editedPainting, reference: e.target.value});
                if (validationErrors.reference) {
                  setValidationErrors({...validationErrors, reference: false});
                }
              }}
              isInvalid={validationErrors.reference}
              className="py-2"
            />
            <Form.Control.Feedback type="invalid">
              La referencia es obligatoria
            </Form.Control.Feedback>
          </Form.Group>

          {/* Campo Categoría */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Categoría</Form.Label>
            <Form.Control
              type="text"
              value={editedPainting.category}
              onChange={(e) => setEditedPainting({...editedPainting, category: e.target.value})}
              className="py-2"
            />
          </Form.Group>

          {/* Tamaños */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold d-block">Tamaños*</Form.Label>
            
            {/* Tamaños predefinidos */}
            <div className="d-flex flex-wrap gap-2 mb-3">
              {PREDEFINED_SIZES.map(size => (
                <Button
                  key={size}
                  variant={editedPainting.sizes.includes(size) ? "primary" : "outline-secondary"}
                  size="sm"
                  onClick={() => handleSizeToggle(size)}
                  className="rounded-pill"
                >
                  {size}
                </Button>
              ))}
            </div>
            
            {/* Tamaño personalizado */}
            <div className="input-group mb-3">
              <Form.Control
                type="text"
                placeholder="Añadir tamaño personalizado"
                value={editedPainting.customSize}
                onChange={(e) => setEditedPainting({...editedPainting, customSize: e.target.value})}
                className="py-2"
              />
              <Button 
                variant="outline-secondary" 
                onClick={handleAddCustomSize}
              >
                <FaPlus />
              </Button>
            </div>
            
            {/* Tamaños seleccionados */}
            {editedPainting.sizes.length > 0 ? (
              <div className="d-flex flex-wrap gap-2">
                {editedPainting.sizes.map((size, i) => (
                  <span key={i} className="badge bg-primary d-flex align-items-center">
                    {size}
                    <Button 
                      variant="link" 
                      className="p-0 ms-2 text-white"
                      onClick={() => handleSizeToggle(size)}
                      style={{ lineHeight: 1 }}
                    >
                      <FaTimes size={12} />
                    </Button>
                  </span>
                ))}
              </div>
            ) : (
              validationErrors.sizes && (
                <Alert variant="danger" className="py-1 px-3 mt-2 d-inline-block">
                  Debes seleccionar al menos un tamaño
                </Alert>
              )
            )}
          </Form.Group>

          {/* Validación de imágenes */}
          {validationErrors.images && (
            <Alert variant="danger" className="py-1 px-3 d-inline-block">
              El cuadro debe tener al menos una imagen
            </Alert>
          )}
        </Form>
      </Modal.Body>
      
      <Modal.Footer className="border-0">
        <Button 
          variant="outline-secondary" 
          onClick={onClose} 
          disabled={isSaving}
          className="px-4 py-2"
        >
          <FaTimes className="me-2" />
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSave} 
          disabled={isSaving}
          className="px-4 py-2"
        >
          {isSaving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Guardando...
            </>
          ) : (
            <>
              <FaCheck className="me-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditPaintingModal;