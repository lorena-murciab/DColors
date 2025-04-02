import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css"; // Estilos personalizados
import { db, collection, getDocs } from "../firebaseConfig";
import PaintingDetail from "./PaintingDetail";

const Gallery = () => {
  const [paintings, setPaintings] = useState([]);
  const [filteredPaintings, setFilteredPaintings] = useState([]);
  const [categories, setCategories] = useState(["all"]);
  const [sizes, setSizes] = useState([]);
  
  // Estados para filtros
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  
  const [selectedPainting, setSelectedPainting] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // 🔹 Cargar cuadros desde Firestore
  useEffect(() => {
    const fetchPaintings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "paintings"));
        const paintingsList = querySnapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt ? new Date(doc.data().createdAt.seconds * 1000) : new Date()
        }));
        setPaintings(paintingsList);
        setFilteredPaintings(paintingsList);
        
        // Extraer categorías únicas de los cuadros
        const uniqueCategories = [...new Set(paintingsList.map(p => p.category))];
        setCategories(["all", ...uniqueCategories.filter(c => c && c !== "Sin categoría")]);
        
        // Extraer tamaños únicos
        const uniqueSizes = [...new Set(paintingsList.map(p => p.size))];
        setSizes(["all", ...uniqueSizes.filter(s => s)]);
      } catch (error) {
        console.error("Error al cargar los cuadros:", error);
      }
    };
    fetchPaintings();
  }, []);

  // 🔹 Aplicar filtros y ordenación
  useEffect(() => {
    let result = [...paintings];
    
    // Filtrar por categoría
    if (selectedCategory !== "all") {
      result = result.filter((painting) => painting.category === selectedCategory);
    }
    
    // Filtrar por tamaño
    if (selectedSize !== "all") {
      result = result.filter((painting) => painting.size === selectedSize);
    }
    
    // Aplicar ordenación
    if (sortOrder === "newest") {
      result.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortOrder === "oldest") {
      result.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortOrder === "titleAsc") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOrder === "titleDesc") {
      result.sort((a, b) => b.title.localeCompare(a.title));
    }
    
    setFilteredPaintings(result);
  }, [selectedCategory, selectedSize, sortOrder, paintings]);

  // Función para obtener la primera imagen de un cuadro
  const getMainImage = (painting) => {
    return painting.images && painting.images.length > 0 
      ? painting.images[0] 
      : 'https://via.placeholder.com/300x250?text=No+imagen';
  };
  
  // Resetear todos los filtros
  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedSize("all");
    setSortOrder("newest");
  };

  // Comprobar si hay filtros activos
  const hasActiveFilters = selectedCategory !== "all" || selectedSize !== "all" || sortOrder !== "newest";

  return (
    <div className="container my-5">
      {/* 🔹 Barra de filtros minimalista */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h4 className="m-0">Galería de obras</h4>
        
        <div className="d-flex align-items-center">
          {/* Indicador de filtros activos y botón de reseteo */}
          {hasActiveFilters && (
            <button 
              className="btn btn-sm btn-link text-decoration-none me-3" 
              onClick={resetFilters}
            >
              Resetear filtros
            </button>
          )}
          
          {/* Botón para mostrar/ocultar filtros */}
          <button 
            className="btn btn-sm btn-outline-dark" 
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Ocultar filtros" : "Filtrar"}
          </button>
        </div>
      </div>
      
      {/* 🔹 Panel de filtros desplegable */}
      {showFilters && (
        <div className="row mb-4 p-3 border border-light rounded animate__animated animate__fadeIn">
          <div className="col-md-4 mb-3">
            <select 
              className="form-select form-select-sm border-0" 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "Todas las categorías" : cat}
                </option>
              ))}
            </select>
          </div>
          
          <div className="col-md-4 mb-3">
            <select 
              className="form-select form-select-sm border-0" 
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              {sizes.map((size) => (
                <option key={size} value={size}>
                  {size === "all" ? "Todas las medidas" : size}
                </option>
              ))}
            </select>
          </div>
          
          <div className="col-md-4 mb-3">
            <select 
              className="form-select form-select-sm border-0" 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Más recientes primero</option>
              <option value="oldest">Más antiguos primero</option>
              <option value="titleAsc">Título (A-Z)</option>
              <option value="titleDesc">Título (Z-A)</option>
            </select>
          </div>
        </div>
      )}

      {/* 🔹 Contador de resultados minimalista */}
      {hasActiveFilters && (
        <div className="mb-4 text-muted small">
          Mostrando {filteredPaintings.length} de {paintings.length} obras
        </div>
      )}

      {/* 🔹 Galería de cuadros */}
      <div className="row">
        {filteredPaintings.length > 0 ? (
          filteredPaintings.map((painting) => (
            <div key={painting.id} className="col-lg-4 col-md-6 mb-4">
              <div
                className="image-container shadow-sm rounded"
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
          <div className="col-12 text-center p-5">
            <p className="mb-3">No hay obras que coincidan con los filtros seleccionados.</p>
            <button className="btn btn-sm btn-outline-dark" onClick={resetFilters}>
              Quitar filtros
            </button>
          </div>
        )}
      </div>

      {/* 🔹 Modal de detalles del cuadro */}
      {selectedPainting && (
        <PaintingDetail 
        painting={selectedPainting} 
        onClose={() => setSelectedPainting(null)}
        onSave={(updatedPainting) => {
          // Tu lógica para guardar los cambios
          console.log("Cuadro actualizado:", updatedPainting);
        }}
      />
      )}
    </div>
  );
};

export default Gallery;