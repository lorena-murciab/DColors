import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
// import { signOut } from "../firebaseConfig"; // 🔹 Se comenta la importación de autenticación
import "../App.css";

const Header = ({ /* user */ }) => {
  const [showSmallHeader, setShowSmallHeader] = useState(false);
  const location = useLocation(); // Detecta cambios de ruta

  useEffect(() => {
    const handleScroll = () => {
      // Detecta si el usuario ha pasado el header grande
      const headerHeight = document.getElementById("large-header")?.offsetHeight || 120; // Altura del header grande
      setShowSmallHeader(window.scrollY > headerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Ejecutarlo una vez para ajustar el estado al cargar la página

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Restablece el estado si el usuario vuelve a la página principal
    if (location.pathname === "/") {
      window.scrollTo(0, 0); // Asegurar que al volver se reinicie
      setShowSmallHeader(false);
    }
  }, [location]);

  return (
    <>
      {/* Header grande (como una sección) */}
      <div id="large-header" className="large-header">
        <img src="/logo_inicio1.png" alt="Logo" className="large-logo" />
      </div>

      {/* Header pequeño (fijo en la parte superior) */}
      {showSmallHeader && (
        <div className="small-header">
          <img src="/logo_inicio1.png" alt="Logo" className="small-logo" />
          <nav>
            <a href="/">Inicio</a>
            <a href="/gallery">Galería</a>
            <a href="/about">Sobre Nosotros</a>
            {/* {user && <a href="/profile">Mi Perfil</a>} */} {/* Enlace opcional para el usuario autenticado */}
            {/* {user ? <button onClick={logout}>Cerrar Sesión</button> : <a href="/login">Iniciar Sesión</a>} */}
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
