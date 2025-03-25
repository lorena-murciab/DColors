import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Importamos el contexto de autenticación
import { auth, signOut } from "../firebaseConfig"; // Importamos la función de cierre de sesión
import "../App.css";

const Header = () => {
  const { user } = useAuth(); // Estado global del usuario
  const [showSmallHeader, setShowSmallHeader] = useState(false);
  const location = useLocation();

  // Determinar si estamos en la ruta Home ("/") o Gallery ("/gallery")
  const isHomeOrGallery = location.pathname === "/" || location.pathname === "/gallery";

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

  // Restablece el estado si el usuario vuelve a la página principal
  useEffect(() => {
    if (location.pathname === "/") {
      window.scrollTo(0, 0);
      setShowSmallHeader(false);
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
        <nav>
          <Link to="/">INICIO</Link>
          <Link to="/gallery">GALERÍA</Link>
          <Link to="/about">SOBRE NOSOTROS</Link>
          {user ? (
            <button onClick={logout} className="btn custom-btn m-2">Cerrar Sesión</button>
          ) : (
            <Link to="/admin">ADMIN</Link>
          )}
        </nav>
      </div>
      )}

      {/* Header pequeño (fijo arriba cuando haces scroll) */}
      {(showSmallHeader || !isHomeOrGallery) && (
        <div className="small-header">
          <img src="/logo_inicio1.png" alt="Logo" className="small-logo" />
          <nav>
            <Link to="/">Inicio</Link>
            <Link to="/gallery">Galería</Link>
            <Link to="/about">Sobre Nosotros</Link>
            {user ? (
              <>
                <Link to="/admin">Admin</Link>
                <button onClick={logout} className="btn custom-btn m-2">Cerrar Sesión</button>
              </>
            ) : null}
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
