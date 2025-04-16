import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Importamos el contexto de autenticación
import { auth, signOut } from "../firebaseConfig"; // Importamos la función de cierre de sesión
import "../App.css";

const Header = () => {
  const { user } = useAuth(); // Estado global del usuario
  const [showSmallHeader, setShowSmallHeader] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMounted = useRef(false);

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
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <>
      {/* Header grande (solo visible en Home y Gallery) */}
      {isHomeOrGallery && (
        <div id="large-header" className="large-header">
          <img src="/Dcolors-logo-white-full.png" alt="Logo" className="large-logo" />
          <nav className="nav-row" style={{
            backgroundColor: 'rgb(38, 38, 38)',
            backdropFilter: 'blur(5px)',
            padding: '0.8rem 2rem',
            width: '100%',
            marginTop: 10,
            fontFamily: 'Arial, sans-serif',
            fontSize: '1rem',
            display: 'flex',
            justifyContent: 'center',  // Centrar el contenido
            gap: '2rem'  // Espacio entre elementos
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
        </div>
      )}

      {/* Header pequeño (fijo arriba cuando haces scroll) */}
      {(showSmallHeader || !isHomeOrGallery) && (
        <div className="small-header">
          <img src="/logo_inicio1.png" alt="Logo" className="small-logo" />
          <nav style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',  // Centrar horizontalmente
            alignItems: 'center',      // Centrar verticalmente
            gap: '2rem',               // Espacio entre elementos
            paddingRight: '80px'       // Compensar el espacio del logo
          }}>
            <Link to="/">Inicio</Link>
            <Link to="/gallery">Galería</Link>
            <Link to="/#about" onClick={handleSectionClick("about")}>Sobre Nosotros</Link>
            <Link to="/#contact" onClick={handleSectionClick("contact")}>Contacto</Link>
            {user && (
              <>
                <Link to="/admin">Administración</Link>
                <button onClick={logout} className="btn custom-btn">Cerrar Sesión</button>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;