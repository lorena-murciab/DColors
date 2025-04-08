import React, { useState, useEffect } from "react";
import { Modal, Button, Alert, Form } from "react-bootstrap";
import { FaCheck, FaTimes, FaPlus } from "react-icons/fa";
import { db, doc, updateDoc, getDocs, collection } from "../firebaseConfig";

const EditPaintingModal = ({ painting, onClose, onSave, onSaveSuccess }) => {
  const [editedPainting, setEditedPainting] = useState({
    title: painting.title || "",
    category: painting.category || "",
    sizes: painting.sizes ? [...painting.sizes] : [],
    reference: painting.reference || "",
    images: painting.images || [],
    author: painting.author || "",
    customSize: "",
    customCategory: "",
    customAuthor: ""
  });

  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableAuthors, setAvailableAuthors] = useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({
    title: false,
    reference: false,
    sizes: false,
    images: false,
    category: false,
    author: false
  });

  const PREDEFINED_SIZES = [
    "150 x 50 cm", "100 x 80 cm", "70 x 140 cm",
    "100 x 130 cm", "100 x 150 cm", "100 x 200 cm",
    "120 x 120 cm", "120 x 150 cm", "60 x 60 cm"
  ];

  // Cargar autores y categorías desde Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "paintings"));
        const paintingsList = snapshot.docs.map(doc => doc.data());

        const categories = [...new Set(paintingsList.map(p => p.category).filter(Boolean))];
        const authors = [...new Set(paintingsList.map(p => p.author).filter(Boolean))];

        setAvailableCategories(categories);
        setAvailableAuthors(authors);
      } catch (err) {
        console.error("Error al cargar categorías/autores:", err);
      }
    };
    fetchData();
  }, []);

  const handleSizeToggle = (size) => {
    setEditedPainting(prev => {
      const newSizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];

      if (validationErrors.sizes && newSizes.length > 0) {
        setValidationErrors(prev => ({ ...prev, sizes: false }));
      }

      return { ...prev, sizes: newSizes };
    });
  };

  const handleAddCustomSize = () => {
    const trimmed = editedPainting.customSize.trim();
    if (trimmed && !editedPainting.sizes.includes(trimmed)) {
      setEditedPainting(prev => ({
        ...prev,
        sizes: [...prev.sizes, trimmed],
        customSize: ""
      }));
      setValidationErrors(prev => ({ ...prev, sizes: false }));
    }
  };

  const handleAddCustomCategory = () => {
    const trimmed = editedPainting.customCategory.trim();
    if (trimmed && !availableCategories.includes(trimmed)) {
      setAvailableCategories(prev => [...prev, trimmed]);
    }
    setEditedPainting(prev => ({
      ...prev,
      category: trimmed,
      customCategory: ""
    }));
    setValidationErrors(prev => ({ ...prev, category: false }));
  };

  const handleAddCustomAuthor = () => {
    const trimmed = editedPainting.customAuthor.trim();
    if (trimmed && !availableAuthors.includes(trimmed)) {
      setAvailableAuthors(prev => [...prev, trimmed]);
    }
    setEditedPainting(prev => ({
      ...prev,
      author: trimmed,
      customAuthor: ""
    }));
    setValidationErrors(prev => ({ ...prev, author: false }));
  };

  const validateForm = () => {
    const errors = {
      title: !editedPainting.title.trim(),
      reference: !editedPainting.reference.trim(),
      sizes: editedPainting.sizes.length === 0,
      images: editedPainting.images.length === 0,
      category: !editedPainting.category.trim(),
      author: !editedPainting.author.trim()
    };
    setValidationErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleSave = async () => {
    setError(null);
    if (!validateForm()) {
      setError("Por favor completa todos los campos obligatorios");
      return;
    }

    setIsSaving(true);
    try {
      const paintingData = {
        title: editedPainting.title.trim(),
        category: editedPainting.category.trim(),
        author: editedPainting.author.trim(),
        sizes: editedPainting.sizes.filter(size => size.trim() !== ""),
        reference: editedPainting.reference.trim()
      };

      await updateDoc(doc(db, "paintings", painting.id), paintingData);

      if (onSave) onSave({ ...painting, ...paintingData });
      onClose();
    } catch (err) {
      console.error("Error al guardar:", err);
      setError("Error al guardar los cambios.");
      const fallbackData = {
        ...painting,
        ...editedPainting
      };
      onSaveSuccess(fallbackData);
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
        {error && (
          <Alert variant="danger">
            <FaTimes className="me-2" />
            {error}
          </Alert>
        )}
        <Form>
          {/* Título */}
          <Form.Group className="mb-3">
            <Form.Label>Título*</Form.Label>
            <Form.Control
              type="text"
              value={editedPainting.title}
              onChange={(e) => setEditedPainting({ ...editedPainting, title: e.target.value })}
              isInvalid={validationErrors.title}
            />
          </Form.Group>

          {/* Referencia */}
          <Form.Group className="mb-3">
            <Form.Label>Referencia*</Form.Label>
            <Form.Control
              type="text"
              value={editedPainting.reference}
              onChange={(e) => setEditedPainting({ ...editedPainting, reference: e.target.value })}
              isInvalid={validationErrors.reference}
            />
          </Form.Group>

          {/* Autor */}
          <Form.Group className="mb-3">
            <Form.Label>Autor*</Form.Label>
            <Form.Select
              value={editedPainting.author}
              onChange={(e) => setEditedPainting({ ...editedPainting, author: e.target.value })}
              isInvalid={validationErrors.author}
            >
              <option value="">Selecciona un autor</option>
              {availableAuthors.map((author, i) => (
                <option key={i} value={author}>{author}</option>
              ))}
            </Form.Select>
            <div className="d-flex mt-2">
              <Form.Control
                placeholder="Nuevo autor"
                value={editedPainting.customAuthor}
                onChange={(e) => setEditedPainting({ ...editedPainting, customAuthor: e.target.value })}
              />
              <Button variant="outline-secondary" onClick={handleAddCustomAuthor} className="ms-2">
                <FaPlus />
              </Button>
            </div>
          </Form.Group>

          {/* Categoría */}
          <Form.Group className="mb-3">
            <Form.Label>Categoría*</Form.Label>
            <Form.Select
              value={editedPainting.category}
              onChange={(e) => setEditedPainting({ ...editedPainting, category: e.target.value })}
              isInvalid={validationErrors.category}
            >
              <option value="">Selecciona una categoría</option>
              {availableCategories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </Form.Select>
            <div className="d-flex mt-2">
              <Form.Control
                placeholder="Nueva categoría"
                value={editedPainting.customCategory}
                onChange={(e) => setEditedPainting({ ...editedPainting, customCategory: e.target.value })}
              />
              <Button variant="outline-secondary" onClick={handleAddCustomCategory} className="ms-2">
                <FaPlus />
              </Button>
            </div>
          </Form.Group>

          {/* Tamaños */}
          <Form.Group className="mb-3">
            <Form.Label>Tamaños*</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {PREDEFINED_SIZES.map((size) => (
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
            <div className="d-flex mt-3">
              <Form.Control
                placeholder="Añadir tamaño personalizado"
                value={editedPainting.customSize}
                onChange={(e) => setEditedPainting({ ...editedPainting, customSize: e.target.value })}
              />
              <Button variant="outline-secondary" onClick={handleAddCustomSize} className="ms-2">
                <FaPlus />
              </Button>
            </div>
            {validationErrors.sizes && (
              <Alert variant="danger" className="mt-2">Selecciona al menos un tamaño</Alert>
            )}
          </Form.Group>

          {validationErrors.images && (
            <Alert variant="danger">El cuadro debe tener al menos una imagen</Alert>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose} disabled={isSaving}>
          <FaTimes className="me-2" />
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Guardando..." : <><FaCheck className="me-2" />Guardar Cambios</>}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditPaintingModal;
