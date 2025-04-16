import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Importamos el contexto de autenticación
import { auth, signOut } from "../firebaseConfig"; // Importamos la función de cierre de sesión
import "../App.css";

const Header = () => {
  const { user } = useAuth(); // Estado global del usuario
  const [showSmallHeader, setShowSmallHeader] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // Estado para menú móvil
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determinar si estamos en la ruta Home ("/") o Gallery ("/gallery")
  const isHomeOrGallery = location.pathname === "/" || location.pathname === "/gallery";

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const smallHeaderHeight = document.querySelector(".small-header")?.offsetHeight || 70;
      // Aumentamos el margen para mejor visibilidad
      const targetPosition = section.offsetTop - smallHeaderHeight - 40;
      
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });
    }
  };

  // Función para manejar el clic en secciones con scroll
  const handleSectionClick = (sectionId) => (e) => {
    e.preventDefault();
    
    // Cerrar el menú móvil si está abierto
    setMenuOpen(false);
    
    if (location.pathname === "/") {
      // Ya estamos en la página principal, solo hacemos scroll
      scrollToSection(sectionId);
    } else {
      // Navegamos a la página principal con hash
      navigate(`/#${sectionId}`);
    }
  };

  // Manejo del scroll para mostrar/ocultar el header pequeño
  useEffect(() => {
    if (!isHomeOrGallery) {
      // Si no estamos en Home o Gallery, mostrar el header pequeño directamente
      setShowSmallHeader(true);
      return;
    }

    const handleScroll = () => {
      const headerHeight = document.getElementById("large-header")?.offsetHeight || 120;
      setShowSmallHeader(window.scrollY > headerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomeOrGallery, location]);

  // Restablece el estado y maneja navegación por hash
  useEffect(() => {
    if (location.pathname === "/") {
      // Resetea la posición del scroll al volver a la página principal
      // SOLO si no hay un hash en la URL
      if (!location.hash) {
        window.scrollTo(0, 0);
      }
      
      setShowSmallHeader(false);
      
      // Manejar el hash al cargar la página
      if (location.hash) {
        // Eliminar el # para obtener el ID de la sección
        const sectionId = location.hash.substring(1);
        
        // Esperar a que el DOM esté completamente cargado
        setTimeout(() => {
          const section = document.getElementById(sectionId);
          if (section) {
            const smallHeaderHeight = document.querySelector(".small-header")?.offsetHeight || 70;
            const targetPosition = section.offsetTop - smallHeaderHeight - 40;
            
            window.scrollTo({
              top: targetPosition,
              behavior: "smooth"
            });
          }
        }, 500); // Aumentamos el tiempo para asegurar que todo esté cargado
      }
    }
  }, [location]);

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth);
      console.log("Sesión cerrada");
      setMenuOpen(false); // Cerrar menú al cerrar sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Toggle para abrir/cerrar menú móvil
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      {/* Header grande (solo visible en Home y Gallery) */}
      {isHomeOrGallery && (
        <div id="large-header" className="large-header">
          <div className="d-flex justify-content-center">
            <img src="/Dcolors-logo-white-full.png" alt="Logo" className="large-logo img-fluid" />
          </div>
          
          {/* Versión escritorio del menú principal */}
          <nav className="nav-row d-none d-md-flex" style={{
            backgroundColor: 'rgb(38, 38, 38)',
            backdropFilter: 'blur(5px)',
            padding: '0.8rem 2rem',
            width: '100%',
            marginTop: 10,
            fontFamily: 'Arial, sans-serif',
            fontSize: '1rem',
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem'
          }}>
            <Link to="/" className="nav-link">INICIO</Link>
            <Link to="/gallery" className="nav-link">GALERÍA</Link>
            <Link to="/#about" onClick={handleSectionClick("about")} className="nav-link">SOBRE NOSOTROS</Link>
            <Link to="/#contact" onClick={handleSectionClick("contact")} className="nav-link">CONTACTO</Link>
            {user && (
              <>
                <Link to="/admin" className="nav-link">ADMINISTRACIÓN</Link>
                <button onClick={logout} className="logout-btn">CERRAR SESIÓN</button>
              </>
            )}
          </nav>
          
          {/* Versión móvil del menú principal */}
          <div className="d-md-none" style={{
            backgroundColor: 'rgb(38, 38, 38)',
            width: '100%',
            marginTop: 10,
          }}>
            <div className="d-flex justify-content-center align-items-center py-2" 
                 onClick={toggleMenu}
                 style={{ cursor: 'pointer' }}>
              <span className="text-white">MENÚ</span>
              <span className="ms-2 text-white">
                {menuOpen ? '▲' : '▼'}
              </span>
            </div>
            
            {menuOpen && (
              <nav className="d-flex flex-column align-items-center py-2" style={{ gap: '1rem' }}>
                <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>INICIO</Link>
                <Link to="/gallery" className="nav-link" onClick={() => setMenuOpen(false)}>GALERÍA</Link>
                <Link to="/#about" onClick={(e) => {
                  handleSectionClick("about")(e);
                  setMenuOpen(false);
                }} className="nav-link">SOBRE NOSOTROS</Link>
                <Link to="/#contact" onClick={(e) => {
                  handleSectionClick("contact")(e);
                  setMenuOpen(false);
                }} className="nav-link">CONTACTO</Link>
                {user && (
                  <>
                    <Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>ADMINISTRACIÓN</Link>
                    <button onClick={logout} className="logout-btn">CERRAR SESIÓN</button>
                  </>
                )}
              </nav>
            )}
          </div>
        </div>
      )}

      {/* Header pequeño (fijo arriba cuando haces scroll) */}
      {(showSmallHeader || !isHomeOrGallery) && (
        <div className="small-header">
          <div className="d-flex align-items-center">
            <img src="/logo_inicio1.png" alt="Logo" className="small-logo" />
            
            {/* Botón de menú móvil */}
            <button 
              className="d-md-none ms-auto me-3 btn"
              onClick={toggleMenu}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'white',
                fontSize: '1.5rem'
              }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
          
          {/* Menú desktop */}
          <nav className="d-none d-md-flex" style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem',
            paddingRight: '80px'
          }}>
            <Link to="/" className="small-nav-link">Inicio</Link>
            <Link to="/gallery" className="small-nav-link">Galería</Link>
            <Link 
              to="/#about" 
              onClick={handleSectionClick("about")} 
              className="small-nav-link"
            >
              Sobre Nosotros
            </Link>
            <Link 
              to="/#contact" 
              onClick={handleSectionClick("contact")} 
              className="small-nav-link"
            >
              Contacto
            </Link>
            {user && (
              <>
                <Link to="/admin" className="small-nav-link">Administración</Link>
                <button onClick={logout} className="small-logout-btn">Cerrar Sesión</button>
              </>
            )}
          </nav>
          
          {/* Menú móvil desplegable */}
          {menuOpen && (
            <div className="d-md-none mobile-menu" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'rgba(38, 38, 38, 0.95)',
              zIndex: 1000,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div className="d-flex flex-column py-3">
                <Link to="/" className="small-nav-link text-center py-2" onClick={() => setMenuOpen(false)}>Inicio</Link>
                <Link to="/gallery" className="small-nav-link text-center py-2" onClick={() => setMenuOpen(false)}>Galería</Link>
                <Link 
                  to="/#about" 
                  onClick={(e) => {
                    handleSectionClick("about")(e);
                    setMenuOpen(false);
                  }} 
                  className="small-nav-link text-center py-2"
                >
                  Sobre Nosotros
                </Link>
                <Link 
                  to="/#contact" 
                  onClick={(e) => {
                    handleSectionClick("contact")(e);
                    setMenuOpen(false);
                  }} 
                  className="small-nav-link text-center py-2"
                >
                  Contacto
                </Link>
                {user && (
                  <>
                    <Link to="/admin" className="small-nav-link text-center py-2" onClick={() => setMenuOpen(false)}>Administración</Link>
                    <div className="text-center py-2">
                      <button onClick={logout} className="small-logout-btn">Cerrar Sesión</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Header;