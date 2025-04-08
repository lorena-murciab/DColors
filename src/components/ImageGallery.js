import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css"; // Estilos personalizados
import { db, collection, getDocs } from "../firebaseConfig";
import PaintingDetail from "./PaintingDetail";

const Gallery = () => {
  const [paintings, setPaintings] = useState([]);
  const [filteredPaintings, setFilteredPaintings] = useState([]);
  const [categories, setCategories] = useState(["all"]);
  const [authors, setAuthors] = useState(["all"]);
  const [sizes, setSizes] = useState([]);
  
  // Estados para filtros
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAuthor, setSelectedAuthor] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  
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

        // Extraer autores únicos
        const uniqueAuthors = [...new Set(paintingsList.map(p => p.author))];
        setAuthors(["all", ...uniqueAuthors.filter(a => a && a !== "Sin autor")]);
        
        // Extraer tamaños únicos
        const allSizes = paintingsList.flatMap(p => p.sizes || []);
        const uniqueSizes = [...new Set(allSizes)];
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

    // Filtrar por autor
    if (selectedAuthor !== "all") {
      result = result.filter((painting) => painting.author === selectedAuthor);
    }
    
    // Filtrar por tamaño
    if (selectedSize !== "all") {
      result = result.filter((painting) => 
        painting.sizes && painting.sizes.includes(selectedSize)
      );
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((painting) =>
        (painting.title && painting.title.toLowerCase().includes(term)) ||
        (painting.reference && painting.reference.toLowerCase().includes(term)) ||
        (painting.author && painting.author.toLowerCase().includes(term)) ||
        (painting.category && painting.category.toLowerCase().includes(term))
      );
    }
    
    // Aplicar ordenación
    result = sortPaintings(result, sortOrder);
    
    setFilteredPaintings(result);
  }, [selectedCategory, selectedAuthor, selectedSize, sortOrder, paintings, searchTerm]);

  // Función para ordenar cuadros
  const sortPaintings = (paintings, order) => {
    const sorted = [...paintings];
    switch (order) {
      case "newest":
        return sorted.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
      case "oldest":
        return sorted.sort((a, b) => a.timestamp?.toDate() - b.timestamp?.toDate());
      case "titleAsc":
        return sorted.sort((a, b) => a.title?.localeCompare(b.title));
      case "titleDesc":
        return sorted.sort((a, b) => b.title?.localeCompare(a.title));
      case "authorAsc":
        return sorted.sort((a, b) => a.author?.localeCompare(b.author));
      case "authorDesc":
        return sorted.sort((a, b) => b.author?.localeCompare(a.author));
      default:
        return sorted;
    }
  };

  // Función para obtener la primera imagen de un cuadro
  const getMainImage = (painting) => {
    return painting.images && painting.images.length > 0 
      ? painting.images[0] 
      : 'https://via.placeholder.com/300x250?text=No+imagen';
  };
  
  // Resetear todos los filtros
  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedAuthor("all");
    setSelectedSize("all");
    setSortOrder("newest");
    setSearchTerm("");
  };

  // Comprobar si hay filtros activos
  const hasActiveFilters = selectedCategory !== "all" || 
                         selectedAuthor !== "all" || 
                         selectedSize !== "all" || 
                         sortOrder !== "newest" || 
                         searchTerm !== "";

  const handlePaintingUpdated = (updatedPainting) => {
    // Actualizar la lista principal de cuadros
    setPaintings(paintings.map(p => 
      p.id === updatedPainting.id ? updatedPainting : p
    ));
  };

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
          {/* Barra de búsqueda */}
          <div className="col-12 mb-4">
            <div className="position-relative">
              <input
                type="text"
                className="form-control border-0 ps-0 border-bottom rounded-0"
                placeholder="Buscar por título, referencia, autor o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'transparent',
                  boxShadow: 'none',
                  paddingLeft: '1.75rem'
                }}
              />
              <i className="bi bi-search position-absolute start-0 top-50 translate-middle-y"></i>
              {searchTerm && (
                <button 
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y p-0"
                  onClick={() => setSearchTerm("")}
                  style={{
                    color: '#6c757d',
                    textDecoration: 'none'
                  }}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>


          <div className="col-md-3 mb-3">
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

          <div className="col-md-3 mb-3">
            <select 
              className="form-select form-select-sm border-0" 
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
            >
              {authors.map((author) => (
                <option key={author} value={author}>
                  {author === "all" ? "Todos los autores" : author}
                </option>
              ))}
            </select>
          </div>
          
          <div className="col-md-3 mb-3">
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
          
          <div className="col-md-3 mb-3">
            <select 
              className="form-select form-select-sm border-0" 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Más recientes primero</option>
              <option value="oldest">Más antiguos primero</option>
              <option value="titleAsc">Título (A-Z)</option>
              <option value="titleDesc">Título (Z-A)</option>
              <option value="authorAsc">Autor (A-Z)</option>
              <option value="authorDesc">Autor (Z-A)</option>
            </select>
          </div>
        </div>
      )}

      {/* 🔹 Contador de resultados */}
      {hasActiveFilters && (
        <div className="mb-4 text-muted small color-primary">
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
        onPaintingUpdated={handlePaintingUpdated}
      />
      )}
    </div>
  );
};

export default Gallery;