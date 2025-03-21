import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Importamos el contexto de autenticación
import { auth, signOut } from "../firebaseConfig"; // Importamos la función de cierre de sesión
import "../App.css";

const Header = () => {
  const { user } = useAuth(); // Estado global del usuario
  const [showSmallHeader, setShowSmallHeader] = useState(false);
  const location = useLocation();

  // Manejo del scroll para mostrar/ocultar el header pequeño
  useEffect(() => {
    const handleScroll = () => {
      const headerHeight = document.getElementById("large-header")?.offsetHeight || 120;
      setShowSmallHeader(window.scrollY > headerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      {/* Header grande */}
      <div id="large-header" className="large-header">
        <img src="/logo_inicio1.png" alt="Logo" className="large-logo" />
        <nav>
          <Link to="/">Inicio</Link>
          <Link to="/gallery">Galería</Link>
          <Link to="/about">Sobre Nosotros</Link>
          {user ? (
            <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
          ) : (
            <Link to="/login">Admin</Link>
          )}
        </nav>
      </div>

      {/* Header pequeño (fijo arriba cuando haces scroll) */}
      {showSmallHeader && (
        <div className="small-header">
          <img src="/logo_inicio1.png" alt="Logo" className="small-logo" />
          <nav>
            <Link to="/">Inicio</Link>
            <Link to="/gallery">Galería</Link>
            <Link to="/about">Sobre Nosotros</Link>
            {user ? (
              <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
            ) : (
              <Link to="/login">Admin</Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
