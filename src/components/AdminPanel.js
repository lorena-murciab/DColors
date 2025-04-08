import React, { useState, useEffect } from "react";
import { db, collection, getDocs, addDoc, getDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "../firebaseConfig";

// Tamaños predefinidos
const PREDEFINED_SIZES = [
  "150 x 50 cm", "100 x 80 cm", "70 x 140 cm", "100 x 130 cm",
  "100 x 150 cm", "100 x 200 cm", "120 x 120 cm", "120 x 150 cm", "60 x 60 cm",
];

const AdminPanel = () => {
  // Estado para almacenar los cuadros
  const [paintings, setPaintings] = useState([]);
  const [newPainting, setNewPainting] = useState({ 
    title: "", 
    category: "", 
    sizes: [], 
    reference: "",
    images: [],
    customSize: "",
    author: "",
  });
  
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [newAuthorInput, setNewAuthorInput] = useState("");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableAuthors, setAvailableAuthors] = useState([]);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [showAuthorsDropdown, setShowAuthorsDropdown] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSizesDropdown, setShowSizesDropdown] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    title: false,
    reference: false,
    images: false,
    sizes: false,
    category: false,
    author: false,
  });

  // Cargar cuadros ya creados desde Firestore
  useEffect(() => {
    const fetchPaintings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "paintings"));
        const paintingsList = querySnapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setPaintings(paintingsList);

        // Extraer categorías únicas
        const categories = [...new Set(paintingsList.map(p => p.category).filter(Boolean))];
        setAvailableCategories(categories);
        
        // Extraer autores únicos (asumiendo que ahora tienes un campo 'author' en tus documentos)
        const authors = [...new Set(paintingsList.map(p => p.author).filter(Boolean))];
        setAvailableAuthors(authors);
      } catch (error) {
        console.error("Error al cargar los cuadros:", error);
      }
    };
    fetchPaintings();
  }, []);
  
  // Función para añadir nueva categoría manualmente
  const handleAddCustomCategory = (categoryName) => {
    if (categoryName.trim() && !availableCategories.includes(categoryName.trim())) {
      // Añade a las categorías disponibles
      setAvailableCategories(prev => [...prev, categoryName.trim()]);
      // Establece como categoría seleccionada
      setNewPainting(prev => ({...prev, category: categoryName.trim()}));
      setValidationErrors(prev => ({...prev, category: false}));
    }
  };
  
  const handleCategorySelect = (category) => {
    setNewPainting(prev => ({
      ...prev,
      category,
    }));
    setShowCategoriesDropdown(false);
    setValidationErrors(prev => ({...prev, category: false}));
  };
  
  const handleAddCustomAuthor = (authorName) => {
    if (authorName.trim() && !availableAuthors.includes(authorName.trim())) {
      // Añade a los autores disponibles
      setAvailableAuthors(prev => [...prev, authorName.trim()]);
      // Establece como autor seleccionado
      setNewPainting(prev => ({...prev, author: authorName.trim()}));
    }
  };
  
  const handleAuthorSelect = (author) => {
    setNewPainting(prev => ({
      ...prev,
      author,
    }));
    setShowAuthorsDropdown(false);
    setValidationErrors(prev => ({...prev, author: false}));
  };

  // Click fuera del dropdown para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event) => {
      /*
      if (!event.target.closest('.dropdown-container')) {
        setShowSizesDropdown(false);
        setShowCategoriesDropdown(false);
        setShowAuthorsDropdown(false);
      } */

        const dropdowns = document.querySelectorAll('.dropdown-container');
        let isClickInside = false;
    
        dropdowns.forEach(dropdown => {
          if (dropdown.contains(event.target)) {
            isClickInside = true;
          }
        });
    
        if (!isClickInside) {
          setShowEditSizesDropdown(false);
          setShowEditCategoriesDropdown(false);
          setShowEditAuthorsDropdown(false);
          // Cierra también los del formulario principal si es necesario
          setShowSizesDropdown(false);
          setShowCategoriesDropdown(false);
          setShowAuthorsDropdown(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Validar campos
  const validateFields = () => {
    const errors = {
      title: !newPainting.title.trim(),
      reference: !newPainting.reference.trim(),
      images: newPainting.images.length === 0,
      sizes: newPainting.sizes.length === 0,
      category: !newPainting.category.trim(),
      author: !newPainting.author.trim(),
    };
    
    setValidationErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  // Convertir y comprimir imágenes
  const handleFilesChange = async (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    if (!files.length) return;
  
    setIsUploading(true);
    
    try {
      const optimizedImages = [];
      for (const file of files) {
        const optimized = await optimizeImage(file);
        if (optimized) optimizedImages.push(optimized);
      }
  
      if (editingPainting) {
        setEditForm(prev => ({
          ...prev,
          images: [...prev.images, ...optimizedImages].slice(0, 4)
        }));
      } else {
        setNewPainting(prev => ({
          ...prev,
          images: [...prev.images, ...optimizedImages].slice(0, 4)
        }));
        setValidationErrors(prev => ({...prev, images: false}));
      }
    } catch (error) {
      console.error("Error optimizando imágenes:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const optimizeImage = async (file, targetSizeKB = 700, maxAttempts = 5) => {
    let quality = 0.85; // Calidad inicial (85%)
    let attempt = 0;
    let result = null;
    
    while (attempt < maxAttempts && !result) {
      attempt++;
      const base64 = await compressImage(file, quality);
      const sizeKB = (base64.length * 0.75) / 1024; // Tamaño aproximado en KB
      
      if (sizeKB <= targetSizeKB) {
        result = base64;
      } else {
        // Reducir calidad progresivamente
        quality = Math.max(0.3, quality - 0.15); // Nunca bajar de 30% calidad
      }
    }
    
    return result || await compressImage(file, 0.3); // Último intento con mínima calidad
  };
  
  const compressImage = (file, quality) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const img = new Image();
        img.src = event.target.result;
  
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          // Tamaño inicial
          let width = img.width;
          let height = img.height;
          
          // Reducción automática de dimensiones
          const maxDimension = quality > 0.6 ? 1000 : 
                             quality > 0.4 ? 800 : 600;
          
          if (width > maxDimension || height > maxDimension) {
            const ratio = Math.min(maxDimension / width, maxDimension / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }
  
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
  
          canvas.toBlob(
            (blob) => {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = () => resolve(reader.result);
            },
            "image/webp",
            quality
          );
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setNewPainting(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  // Manejar selección/deselección de tamaños
  const handleSizeToggle = (size) => {
    setNewPainting(prev => {
      if (prev.sizes.includes(size)) {
        return {
          ...prev,
          sizes: prev.sizes.filter(s => s !== size)
        };
      } else {
        return {
          ...prev,
          sizes: [...prev.sizes, size]
        };
      }
    });
    setValidationErrors(prev => ({...prev, sizes: false}));
  };

  // Añadir tamaño personalizado
  const handleAddCustomSize = () => {
    if (newPainting.customSize && !newPainting.sizes.includes(newPainting.customSize)) {
      setNewPainting(prev => ({
        ...prev,
        sizes: [...prev.sizes, prev.customSize],
        customSize: ""
      }));
      setValidationErrors(prev => ({...prev, sizes: false}));
    }
  };

  // Subir cuadro a Firestore
  const handleAddPainting = async () => {
    if (!validateFields()) return;
  
    setIsUploading(true);

    try {
      const paintingData = {
        title: newPainting.title.trim(),
        category: newPainting.category.trim(),
        sizes: newPainting.sizes,
        reference: newPainting.reference.trim(),
        images: newPainting.images,
        author: newPainting.author.trim(),
        timestamp: serverTimestamp(),
      };
  
      const docRef = await addDoc(collection(db, "paintings"), paintingData);
      const docSnap = await getDoc(docRef); // Obtener el documento recién creado y con el timestamp resuelto
      // Añadir el nuevo cuadro a la lista de cuadros
      setPaintings(prev => [...prev, { id: docSnap.id, ...docSnap.data() }]);

      // Actualiza la lista de autores disponibles si es nuevo
      if (newPainting.author.trim() && !availableAuthors.includes(newPainting.author.trim())) {
        setAvailableAuthors(prev => [...prev, newPainting.author.trim()]);
      }

      // Actualiza la lista de categorías disponibles si es nueva
      if (newPainting.category.trim() && !availableCategories.includes(newPainting.category.trim())) {
        setAvailableCategories(prev => [...prev, newPainting.category.trim()]);
      }
  
      // Resetear formulario
      setNewPainting({ 
        title: "", 
        category: "",
        sizes: [],
        reference: "",
        images: [],
        customSize: "",
        author: "",
      });
      setValidationErrors({
        title: false,
        reference: false,
        images: false,
        sizes: false,
        category: false,
        author: false,
      });
    } catch (error) {
      console.error("Error al añadir cuadro:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Editar cuadro
  // Nuevos estados para controlar los dropdowns en edición
  const [showEditSizesDropdown, setShowEditSizesDropdown] = useState(false);
  const [showEditCategoriesDropdown, setShowEditCategoriesDropdown] = useState(false);
  const [showEditAuthorsDropdown, setShowEditAuthorsDropdown] = useState(false);
  const [editCustomSize, setEditCustomSize] = useState("");

  const [editingPainting, setEditingPainting] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    category: "",
    sizes: [],
    reference: "",
    images: [],
    author: "",
  });
  
  // Al hacer clic en Editar
  const handleEditClick = (painting) => {
    setEditingPainting(painting);
    setEditForm({
      title: painting.title,
      category: painting.category,
      sizes: painting.sizes || [],
      reference: painting.reference,
      images: painting.images || [],
      author: painting.author || "",
    });
      // Resetear estados de dropdown
      setShowEditSizesDropdown(false);
      setShowEditCategoriesDropdown(false);
      setShowEditAuthorsDropdown(false);
      setEditCustomSize("");
  };
  
  // Guardar cambios
  const handleSaveEdit = async () => {
    // Validaciones
    if (!editForm.title.trim()) {
      alert("El título no puede estar vacío");
      return;
    }

    if (!editForm.category.trim()) {
      alert("La categoría no puede estar vacía");
      return;
    }

    if (!editForm.reference.trim()) {
      alert("La referencia no puede estar vacía");
      return;
    }

    if (editForm.sizes.length === 0) {
      alert("Debes ingresar al menos un tamaño");
      return;
    }

    if (!editForm.author.trim()) {
      alert("El autor no puede estar vacío");
      return;
    }
  
    if (editForm.images.length === 0) {
      alert("Debes tener al menos una imagen");
      return;
    }
  
    const validSizes = editForm.sizes.filter(size => size.trim() !== "");
    if (validSizes.length === 0) {
      alert("Debes ingresar al menos un tamaño válido");
      return;
    }
  
    try {
      setIsUploading(true);
      await updateDoc(doc(db, "paintings", editingPainting.id), {
        title: editForm.title.trim(),
        category: editForm.category.trim(),
        author: editForm.author.trim(),
        sizes: validSizes, // Usamos solo los tamaños válidos
        reference: editForm.reference.trim(),
        images: editForm.images,
        timestamp: serverTimestamp() // Actualizamos la marca de tiempo
      });
      
      if (editForm.author.trim() && !availableAuthors.includes(editForm.author.trim())) {
        setAvailableAuthors(prev => [...prev, editForm.author.trim()]);
      }

      if (editForm.category.trim() && !availableCategories.includes(editForm.category.trim())) {
        setAvailableCategories(prev => [...prev, editForm.category.trim()]);
      }
  
      setPaintings(paintings.map(p => 
        p.id === editingPainting.id ? { 
          ...p, 
          title: editForm.title.trim(),
          category: editForm.category.trim(),
          author: editForm.author.trim(),
          sizes: validSizes,
          reference: editForm.reference.trim(),
          images: editForm.images
        } : p
      ));
      
      setEditingPainting(null);
      alert("✅ Cambios guardados correctamente");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert(`❌ Error al guardar: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Eliminar cuadro
  const handleDeletePainting = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este cuadro?")) {
      try {
        await deleteDoc(doc(db, "paintings", id));
        setPaintings(paintings.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error al eliminar cuadro:", error);
      }
    }
  };

  return (
    <div className="container mt-5 pt-5">
      <h2 className="mb-4">Panel de Administración</h2>

      {/* Formulario para añadir cuadros */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h3 className="card-title mb-4">Añadir nuevo cuadro</h3>
          
          <div className="row g-3">

            <div className="col-md-3">
              <label className="form-label">Título</label>
              <input
                type="text"
                placeholder="Título del cuadro"
                value={newPainting.title}
                onChange={(e) => {
                  setNewPainting({ ...newPainting, title: e.target.value });
                  setValidationErrors(prev => ({...prev, title: false}));
                }}
                className={`form-control ${validationErrors.title ? 'is-invalid' : ''}`}
              />
              {validationErrors.title && (
                <div className="invalid-feedback">El título es obligatorio</div>
              )}
            </div>

              {/* Campo de Autor */}
              <div className="col-md-3">
                <label className="form-label">Autor</label>
                <div className="position-relative dropdown-container">
                  <button 
                    type="button" 
                    className={`btn w-100 text-start d-flex justify-content-between align-items-center ${validationErrors.author ? 'btn-outline-danger' : 'btn-outline-primary'}`}
                    onClick={() => {
                      setShowAuthorsDropdown(!showAuthorsDropdown);
                      setShowCategoriesDropdown(false); // Cierra otros dropdowns
                      setShowSizesDropdown(false);
                    }}
                  >
                    <span>
                      {newPainting.author || 'Seleccionar autor'}
                    </span>
                    <i className={`bi bi-chevron-${showAuthorsDropdown ? 'up' : 'down'}`}></i>
                  </button>
                  
                  {showAuthorsDropdown && (
                    <div className="position-absolute start-0 end-0 mt-1 p-2 border rounded bg-white shadow-sm" style={{ zIndex: 1000 }}>
                      {/* Opciones existentes */}
                      <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '10px' }}>
                        {availableAuthors.map(author => (
                          <div
                            key={author}
                            className={`p-2 ${newPainting.author === author ? 'bg-primary text-white' : 'hover-bg'}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              handleAuthorSelect(author);
                              setNewAuthorInput(""); // Limpia el input al seleccionar existente
                            }}                          >
                            {author}
                          </div>
                        ))}
                      </div>
                      
                      {/* Input para nuevo autor */}
                      <hr className="my-2" />
                      <div className="input-group" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          placeholder="Nuevo autor"
                          value={newAuthorInput}  // Usa el estado separado
                          onChange={(e) => setNewAuthorInput(e.target.value)}
                          className="form-control"
                          onFocus={(e) => e.stopPropagation()}
                        />
                        <button 
                          className="btn btn-outline-secondary" 
                          type="button"
                          onClick={() => {
                            if (newAuthorInput.trim()) {
                              handleAddCustomAuthor(newAuthorInput);
                              setNewAuthorInput(""); // Limpia el input después de añadir
                            }
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {validationErrors.author && (
                  <div className="text-danger small">Selecciona un autor</div>
                )}
              </div>
            
            {/* Campo de Categoría */}
            <div className="col-md-3">
              <label className="form-label">Categoría</label>
              <div className="position-relative dropdown-container">
                <button 
                  type="button" 
                  className={`btn w-100 text-start d-flex justify-content-between align-items-center ${validationErrors.category ? 'btn-outline-danger' : 'btn-outline-primary'}`}
                  onClick={() => {
                    setShowCategoriesDropdown(!showCategoriesDropdown);
                    setShowAuthorsDropdown(false); // Cierra otros dropdowns
                    setShowSizesDropdown(false);
                  }}
                >
                  <span>
                    {newPainting.category || 'Seleccionar categoría'}
                  </span>
                  <i className={`bi bi-chevron-${showCategoriesDropdown ? 'up' : 'down'}`}></i>
                </button>
                
                {showCategoriesDropdown && (
                  <div className="position-absolute start-0 end-0 mt-1 p-2 border rounded bg-white shadow-sm" style={{ zIndex: 1000 }}>
                    {/* Opciones existentes */}
                    <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '10px' }}>
                      {availableCategories.map(category => (
                        <div
                          key={category}
                          className={`p-2 ${newPainting.category === category ? 'bg-primary text-white' : 'hover-bg'}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            handleCategorySelect(category);
                            setNewCategoryInput(""); // Limpia el input al seleccionar existente
                          }}
                        >
                          {category}
                        </div>
                      ))}
                    </div>
                    
                    {/* Input para nueva categoría */}
                    <hr className="my-2" />
                    <div className="input-group" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        placeholder="Nueva categoría"
                        value={newCategoryInput}  // Usa el estado separado
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        className="form-control"
                        onFocus={(e) => e.stopPropagation()}
                      />
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => {
                          if (newCategoryInput.trim()) {
                            handleAddCustomCategory(newCategoryInput);
                            setNewCategoryInput(""); // Limpia el input después de añadir
                          }
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {validationErrors.category && (
                <div className="text-danger small">Selecciona una categoría</div>
              )}
            </div>
            
            <div className="col-md-6 sizes-dropdown-container">
              <label className="form-label">Tamaños</label>
              <div className="position-relative dropdown-container">
                <button 
                  type="button" 
                  className={`btn w-100 text-start d-flex justify-content-between align-items-center ${validationErrors.sizes ? 'btn-outline-danger' : 'btn-outline-primary'}`}
                  onClick={() => {
                    setShowSizesDropdown(!showSizesDropdown);
                    setShowCategoriesDropdown(false); // Cierra otros dropdowns
                    setShowAuthorsDropdown(false); // Cierra otros dropdowns
                  }}
                >
                  <span>
                    {newPainting.sizes.length === 0 
                      ? 'Seleccionar tamaños' 
                      : `${newPainting.sizes.length} tamaño(s) seleccionado(s)`}
                  </span>
                  <i className={`bi bi-chevron-${showSizesDropdown ? 'up' : 'down'}`}></i>
                </button>
                
                {/* Dropdown con los tamaños predefinidos */}
                {showSizesDropdown && (
                  <div className="position-absolute start-0 end-0 mt-1 p-2 border rounded bg-white shadow-sm" style={{ zIndex: 1000 }}>
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      {PREDEFINED_SIZES.map(size => (
                        <button
                          key={size}
                          type="button"
                          className={`btn btn-sm ${newPainting.sizes.includes(size) ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => handleSizeToggle(size)}
                          style={{ minWidth: '100px' }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    
                    <hr className="my-2" />
                    
                    {/* Input para tamaño personalizado */}
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="Añadir tamaño personalizado (ej: 45x60 cm)"
                        value={newPainting.customSize}
                        onChange={(e) => setNewPainting({...newPainting, customSize: e.target.value})}
                        className="form-control"
                      />
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={handleAddCustomSize}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Muestra los tamaños seleccionados */}
              <div className="mt-2">
                {newPainting.sizes.length > 0 && (
                  <div className="d-flex flex-wrap gap-1">
                    {newPainting.sizes.map(size => (
                      <span key={size} className="badge bg-primary d-flex align-items-center">
                        {size}
                        <button 
                          type="button" 
                          className="btn-close btn-close-white ms-2" 
                          style={{ fontSize: '0.7rem' }}
                          onClick={() => handleSizeToggle(size)}
                        ></button>
                      </span>
                    ))}
                  </div>
                )}
                {validationErrors.sizes && (
                  <div className="text-danger small">Selecciona al menos un tamaño</div>
                )}
              </div>
            </div>

            <div className="col-md-3">
              <label className="form-label">Número de referencia</label>
              <input
                type="text"
                placeholder="Ej: ABC123"
                value={newPainting.reference}
                onChange={(e) => {
                  setNewPainting({ ...newPainting, reference: e.target.value });
                  setValidationErrors(prev => ({...prev, reference: false}));
                }}
                className={`form-control ${validationErrors.reference ? 'is-invalid' : ''}`}
              />
              {validationErrors.reference && (
                <div className="invalid-feedback">La referencia es obligatoria</div>
              )}
            </div>
          </div>

          {/* Selección de imágenes */}
          <div className="mt-4">
            <label className="form-label">Imágenes (máx. 4)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFilesChange} 
              className="d-none" 
              id="fileInput" 
              multiple
            />
            
            <div className="d-flex flex-wrap gap-2 mb-3">
              <button 
                className={`btn ${validationErrors.images ? 'btn-outline-danger' : 'btn-outline-secondary'}`} 
                onClick={() => document.getElementById('fileInput').click()}
                disabled={newPainting.images.length >= 4 || isUploading}
              >
                <i className="bi bi-plus-lg"></i>
                {newPainting.images.length > 0 ? 'Añadir más' : 'Seleccionar imágenes'}
              </button>
              
              {newPainting.images.length > 0 && (
                <span className="align-self-center text-muted">
                  {newPainting.images.length}/4 imágenes seleccionadas
                </span>
              )}
            </div>
            {validationErrors.images && (
              <div className="text-danger small">Debes añadir al menos una imagen</div>
            )}

            {/* Vista previa de imágenes */}
            {newPainting.images.length > 0 && (
              <div className="row g-2">
                {newPainting.images.map((img, index) => (
                  <div key={index} className="col-6 col-md-3 position-relative">
                    <img 
                      src={img} 
                      alt={`Vista previa ${index + 1}`} 
                      className="img-fluid rounded border"
                      style={{ height: '150px', width: '100%', objectFit: 'cover' }}
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                      style={{ width: '28px', height: '28px', padding: '0' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={handleAddPainting} 
            className="btn btn-primary mt-3" 
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Procesando...
              </>
            ) : 'Añadir cuadro'}
          </button>
        </div>
      </div>

      {/* Lista de cuadros */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="card-title mb-4">Lista de cuadros</h3>
          
          {paintings.length === 0 ? (
            <div className="alert alert-info">No hay cuadros registrados</div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Imágenes</th>
                    <th>Detalles</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>

                {/* Ordenar cuadros por fecha de creación (más recientes primero) */}
                {paintings
                  .slice() // Creamos una copia para no mutar el array original
                  .sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate()) // Orden descendente
                  .map((painting) => (
                    <tr key={painting.id}>
                      <td style={{ width: '150px' }}>
                        {painting.images?.length > 0 && (
                          <div className="d-flex gap-1">
                            {painting.images.slice(0, 2).map((img, i) => (
                              <img 
                                key={i}
                                src={img} 
                                alt={`Miniatura ${i + 1}`} 
                                className="img-thumbnail"
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              />
                            ))}
                            {painting.images.length > 2 && (
                              <span className="badge bg-secondary align-self-center">
                                +{painting.images.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        <div>
                          <strong>{painting.title}</strong>
                          <div className="text-muted small">
                            {painting.category} • 
                            {painting.author} • 
                            {painting.sizes?.join(", ")}
                            {painting.reference && (
                              <> • <span className="fw-medium">Ref: {painting.reference}</span></>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button 
                            onClick={() => handleEditClick(painting)} 
                            className="btn btn-sm btn-warning"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDeletePainting(painting.id)} 
                            className="btn btn-sm btn-outline-danger"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para editar cuadro */}
      {editingPainting && (
      <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Editar cuadro</h5>
              <button type="button" className="btn-close" onClick={() => setEditingPainting(null)}></button>
            </div>

            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">

              {/* Sección de edición de texto */ }
              <div className="mb-3">
                <label className="form-label">Título</label>
                <input
                  type="text"
                  className={`form-control ${!editForm.title.trim() ? 'is-invalid' : ''}`}
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                />
                {!editForm.title.trim() && (
                  <div className="invalid-feedback">El título es obligatorio</div>
                )}
              </div>

              {/* Dropdown Categoría */}
              <div className="mb-3">
                <label className="form-label">Categoría</label>
                <div className="position-relative dropdown-container">
                  <button 
                    type="button" 
                    className={`btn w-100 text-start d-flex justify-content-between align-items-center ${!editForm.category ? 'btn-outline-danger' : 'btn-outline-primary'}`}
                    onClick={() => {
                      setShowEditCategoriesDropdown(!showEditCategoriesDropdown);
                      setShowEditAuthorsDropdown(false);
                      setShowEditSizesDropdown(false);
                    }}
                  >
                    <span>{editForm.category || 'Seleccionar categoría'}</span>
                    <i className={`bi bi-chevron-${showEditCategoriesDropdown ? 'up' : 'down'}`}></i>
                  </button>
                  
                  {showEditCategoriesDropdown && (
                    <div className="position-absolute start-0 end-0 mt-1 p-2 border rounded bg-white shadow-sm" style={{ zIndex: 1060 }}>
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {availableCategories.map(category => (
                          <div
                            key={category}
                            className={`p-2 ${editForm.category === category ? 'bg-primary text-white' : 'hover-bg'}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setEditForm({...editForm, category});
                              setShowEditCategoriesDropdown(false);
                            }}
                          >
                            {category}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {!editForm.category && (
                    <div className="text-danger small">Selecciona una categoría</div>
                  )}
                </div>
              </div>

              {/* Dropdown Autor */}
              <div className="mb-3">
                <label className="form-label">Autor</label>
                <div className="position-relative dropdown-container">
                  <button 
                    type="button" 
                    className="btn w-100 text-start d-flex justify-content-between align-items-center btn-outline-primary"
                    onClick={() => {
                      setShowEditAuthorsDropdown(!showEditAuthorsDropdown);
                      setShowEditCategoriesDropdown(false);
                      setShowEditSizesDropdown(false);
                    }}
                  >
                    <span>{editForm.author || 'Seleccionar autor'}</span>
                    <i className={`bi bi-chevron-${showEditAuthorsDropdown ? 'up' : 'down'}`}></i>
                  </button>
                  
                  {showEditAuthorsDropdown && (
                    <div className="position-absolute start-0 end-0 mt-1 p-2 border rounded bg-white shadow-sm" style={{ zIndex: 1060 }}>
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {availableAuthors.map(author => (
                          <div
                            key={author}
                            className={`p-2 ${editForm.author === author ? 'bg-primary text-white' : 'hover-bg'}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setEditForm({...editForm, author});
                              setShowEditAuthorsDropdown(false);
                            }}
                          >
                            {author}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dropdown Tamaños */}
              <div className="mb-3">
                <label className="form-label">Tamaños</label>
                <div className="position-relative dropdown-container">
                  <button 
                    type="button" 
                    className={`btn w-100 text-start d-flex justify-content-between align-items-center ${editForm.sizes.length === 0 ? 'btn-outline-danger' : 'btn-outline-primary'}`}
                    onClick={() => {
                      setShowEditSizesDropdown(!showEditSizesDropdown);
                      setShowEditCategoriesDropdown(false);
                      setShowEditAuthorsDropdown(false);
                    }}
                  >
                    <span>
                      {editForm.sizes.length === 0 
                        ? 'Seleccionar tamaños' 
                        : `${editForm.sizes.length} tamaño(s) seleccionado(s)`}
                    </span>
                    <i className={`bi bi-chevron-${showEditSizesDropdown ? 'up' : 'down'}`}></i>
                  </button>
                  
                  {showEditSizesDropdown && (
                    <div className="position-absolute start-0 end-0 mt-1 p-2 border rounded bg-white shadow-sm" style={{ zIndex: 1060 }}>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        {PREDEFINED_SIZES.map(size => (
                          <button
                            key={size}
                            type="button"
                            className={`btn btn-sm ${editForm.sizes.includes(size) ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => {
                              const newSizes = editForm.sizes.includes(size)
                                ? editForm.sizes.filter(s => s !== size)
                                : [...editForm.sizes, size];
                              setEditForm({...editForm, sizes: newSizes});
                            }}
                            style={{ minWidth: '100px' }}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      
                      <hr className="my-2" />
                      
                      <div className="input-group">
                        <input
                          type="text"
                          placeholder="Añadir tamaño personalizado"
                          value={editCustomSize}
                          onChange={(e) => setEditCustomSize(e.target.value)}
                          className="form-control"
                        />
                        <button 
                          className="btn btn-outline-secondary" 
                          type="button"
                          onClick={() => {
                            if (editCustomSize && !editForm.sizes.includes(editCustomSize)) {
                              setEditForm({
                                ...editForm,
                                sizes: [...editForm.sizes, editCustomSize]
                              });
                              setEditCustomSize("");
                            }
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                  {editForm.sizes.length === 0 && (
                    <div className="text-danger small">Selecciona al menos un tamaño</div>
                  )}
                  
                  {/* Muestra los tamaños seleccionados */}
                  <div className="mt-2">
                    {editForm.sizes.length > 0 && (
                      <div className="d-flex flex-wrap gap-1">
                        {editForm.sizes.map(size => (
                          <span key={size} className="badge bg-primary d-flex align-items-center">
                            {size}
                            <button 
                              type="button" 
                              className="btn-close btn-close-white ms-2" 
                              style={{ fontSize: '0.7rem' }}
                              onClick={() => {
                                setEditForm({
                                  ...editForm,
                                  sizes: editForm.sizes.filter(s => s !== size)
                                });
                              }}
                            ></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Referencia</label>
                <input
                  type="text"
                  className={`form-control ${!editForm.reference.trim() ? 'is-invalid' : ''}`}
                  value={editForm.reference}
                  onChange={(e) => setEditForm({...editForm, reference: e.target.value})}
                />
                {!editForm.reference.trim() && (
                  <div className="invalid-feedback">La referencia es obligatoria</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
                {/* Sección de edición de imágenes */}
                <div className="mb-3">
                <label className="form-label">Imágenes</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFilesChange} 
                  className="d-none" 
                  id="editFileInput" 
                  multiple
                /> 

                <button 
                  className={`btn ${editForm.images.length > 4 ? 'btn-outline-danger' : 'btn-outline-secondary'} mb-2 ms-2 `}
                  onClick={() => document.getElementById('editFileInput').click()}
                  disabled={editForm.images.length >= 4 || isUploading}
                >
                  <i className="bi bi-plus-lg"></i>
                  Añadir imágenes
                </button>

                {editForm.images.length === 0 ? (
                  <div className="text-danger small">Debes añadir al menos una imagen</div>
                ) : (
                <div className="alert alert-info p-2 small">
                  <i className="bi bi-info-circle"></i>
                  Puedes añadir hasta 4 imágenes. Haz clic en X para eliminar.
                </div>
                )}

                {/* Vista previa de imágenes editables */}
                <div className="row g-2 mt-2">
                  {editForm.images.map((img, index) => (
                    <div key={index} className="col-6 position-relative">
                      <img 
                        src={img} 
                        alt={`Vista previa ${index + 1}`} 
                        className="img-fluid rounded border"
                        style={{ height: '100px', width: '100%', objectFit: 'cover' }}
                      />
                      <button
                        onClick={() => {
                          if (editForm.images.length > 1) {
                            setEditForm(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }));
                          } else {
                            alert("Debe haber al menos una imagen");
                          }
                        }}
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                        style={{ width: '24px', height: '24px', padding: '0' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <datalist id="categoriesList">
          {availableCategories.map((category, index) => (
            <option key={index} value={category} />
          ))}
        </datalist>

        <datalist id="authorsList">
          {availableAuthors.map((author, index) => (
            <option key={index} value={author} />
          ))}
        </datalist>
                
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setEditingPainting(null)}
              >
                Cancelar
              </button>
              <button 
            className="btn btn-primary" 
            onClick={handleSaveEdit}
            disabled={
              isUploading || 
              editForm.images.length === 0 || 
              !editForm.title.trim() ||
              !editForm.category ||
              editForm.sizes.length === 0
            }
          >
            {isUploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Guardando...
              </>
            ) : 'Guardar cambios'}
          </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default AdminPanel;