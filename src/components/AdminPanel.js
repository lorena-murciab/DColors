import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import { db, collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "../firebaseConfig";

const AdminPanel = () => {
  const [paintings, setPaintings] = useState([]);
  const [newPainting, setNewPainting] = useState({ 
    title: "", 
    category: "", 
    size: "", 
    images: [] 
  });
  const [isUploading, setIsUploading] = useState(false);
  // const navigate = useNavigate();

  // Cargar cuadros desde Firestore
  useEffect(() => {
    const fetchPaintings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "paintings"));
        const paintingsList = querySnapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setPaintings(paintingsList);
      } catch (error) {
        console.error("Error al cargar los cuadros:", error);
      }
    };
    fetchPaintings();
  }, []);

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
  
      setNewPainting(prev => ({
        ...prev,
        images: [...prev.images, ...optimizedImages].slice(0, 4)
      }));
    } catch (error) {
      console.error("Error optimizando imágenes:", error);
      alert("Algunas imágenes no pudieron optimizarse");
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
      
      console.log(`Intento ${attempt}: Calidad ${quality} -> ${sizeKB.toFixed(2)}KB`);
      
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
  

  // Subir cuadro a Firestore
  const handleAddPainting = async () => {
    const title = newPainting.title.trim();
    const category = newPainting.category.trim();
    const size = newPainting.size.trim();
    
    if (!title) {
      alert("El título no puede estar vacío");
      return;
    }
    
    if (newPainting.images.length === 0) {
      alert("Debes añadir al menos una imagen");
      return;
    }
  
    setIsUploading(true);

    try {
      console.log("Preparando datos para Firestore..."); // Debug
      const paintingData = {
        title,
        category: category || "Sin categoría",
        size: size || "No especificado",
        images: newPainting.images,
        timestamp: serverTimestamp(),
      };
  
      console.log("Intentando añadir documento..."); // Debug
      const docRef = await addDoc(collection(db, "paintings"), paintingData);
      console.log("Documento añadido con ID:", docRef.id); // Debug
  
      // Actualizar estado optimista
      setPaintings(prev => [...prev, { id: docRef.id, ...paintingData }]);
  
    // Resetear formulario
    setNewPainting({ 
      title: "", 
      category: "", 
      size: "", 
      images: [] 
    });

    alert("✅ Cuadro añadido correctamente");
    console.log("Estado actualizado, cuadros:", paintings.length + 1); // Debug
  } catch (error) {
    console.error("❌ Error al añadir cuadro:", error);
    alert(`Error al añadir cuadro: ${error.message}`);
  } finally {
    setIsUploading(false);
  }
};

  // Editar cuadro
  const handleEditPainting = async (id) => {
    const painting = paintings.find((p) => p.id === id);
    const newTitle = prompt("Nuevo título:", painting.title);
    const newCategory = prompt("Nueva categoría:", painting.category);
    const newSize = prompt("Nuevo tamaño:", painting.size);
    
    if (newTitle && newCategory && newSize) {
      try {
        await updateDoc(doc(db, "paintings", id), {
          title: newTitle,
          category: newCategory,
          size: newSize,
        });

        setPaintings(paintings.map((p) => 
          p.id === id ? { ...p, title: newTitle, category: newCategory, size: newSize } : p
        ));
        alert("Cuadro modificado correctamente.");
      } catch (error) {
        console.error("Error al editar cuadro:", error);
      }
    }
  };

  // Eliminar cuadro
  const handleDeletePainting = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este cuadro?")) {
      try {
        await deleteDoc(doc(db, "paintings", id));
        setPaintings(paintings.filter((p) => p.id !== id));
        alert("Cuadro eliminado correctamente.");
      } catch (error) {
        console.error("Error al eliminar cuadro:", error);
      }
    }
  };

  return (
    <div className="container mt-5 pt-5"> {/* Añadido pt-4 para evitar solapamiento con header */}
      <h2 className="mb-4">Panel de Administración</h2>

      {/* Formulario para añadir cuadros */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h3 className="card-title mb-4">Añadir nuevo cuadro</h3>
          
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Título</label>
              <input
                type="text"
                placeholder="Título del cuadro"
                value={newPainting.title}
                onChange={(e) => setNewPainting({ ...newPainting, title: e.target.value })}
                className="form-control"
              />
            </div>
            
            <div className="col-md-4">
              <label className="form-label">Categoría</label>
              <input
                type="text"
                placeholder="Ej: Abstracto, Retrato..."
                value={newPainting.category}
                onChange={(e) => setNewPainting({ ...newPainting, category: e.target.value })}
                className="form-control"
              />
            </div>
            
            <div className="col-md-4">
              <label className="form-label">Tamaño</label>
              <input
                type="text"
                placeholder="Ej: 50x70 cm"
                value={newPainting.size}
                onChange={(e) => setNewPainting({ ...newPainting, size: e.target.value })}
                className="form-control"
              />
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
                className="btn btn-outline-secondary" 
                onClick={() => document.getElementById('fileInput').click()}
                disabled={newPainting.images.length >= 4 || isUploading}
              >
                <i className="bi bi-plus-lg me-2"></i>
                {newPainting.images.length > 0 ? 'Añadir más' : 'Seleccionar imágenes'}
              </button>
              
              {newPainting.images.length > 0 && (
                <span className="align-self-center text-muted">
                  {newPainting.images.length}/4 imágenes seleccionadas
                </span>
              )}
            </div>

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
            disabled={isUploading || newPainting.images.length === 0}
          >
            {isUploading ? (
              <div className="alert alert-info my-3">
                <div className="d-flex align-items-center">
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  <span>Optimizando imágenes ({newPainting.images.length + 1}/4)...</span>
                </div>
                <div className="progress mt-2">
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated" 
                    style={{ width: `${(newPainting.images.length / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
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
                  {paintings.map((painting) => (
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
                            {painting.category} • {painting.size}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                        <button 
                          onClick={() => handleEditPainting(painting.id)} 
                          className="btn btn-sm"
                          style={{
                            backgroundColor: 'rgba(255, 193, 7, 0.2)',
                            border: '1px solid #ffc107',
                            color: '#b68500',
                            fontWeight: '500',
                            padding: '0.35rem 0.75rem',
                            marginRight: '0.5rem',
                            transition: 'all 0.3s ease',
                            borderRadius: '4px'
                          }}
                          
                        >
                          Editar
                        </button>

                        <button 
                          onClick={() => handleDeletePainting(painting.id)} 
                          className="btn btn-sm"
                          style={{
                            backgroundColor: 'rgba(220, 53, 69, 0.1)',
                            border: '1px solid #dc3545',
                            color: '#a71d2a',
                            fontWeight: '500',
                            padding: '0.35rem 0.75rem',
                            transition: 'all 0.3s ease',
                            borderRadius: '4px',
                          }}
                          
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
    </div>
  );
};

export default AdminPanel;