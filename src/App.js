import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom"; // Para manejar rutas
// import { auth, onAuthStateChanged } from "./firebaseConfig"; // Escuchar cambios de autenticación
import Auth from "./components/LoginAdmin";
import Gallery from "./components/ImageGallery";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { IoIosArrowUp } from "react-icons/io";
import Header from "./components/Header"; // Header dinámico
import { FaWhatsapp, FaPhone } from "react-icons/fa"; // Importar iconos


const App = () => {
  // const [user, setUser] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false); // Estado para mostrar botón de scroll

  // Botón de scroll rápido al llegar a cierta altura
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }


  // Se comenta el useEffect que maneja la autenticación
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //     setUser(currentUser); // Guarda el usuario si está autenticado
  //   });
  //   return () => unsubscribe(); // Limpieza al desmontar
  // }, []);

  return (
    <Router>
      <div>
        {/* Header dinámico */}
        {/* 🔹 Se comenta la prop "user" porque el estado del usuario está desactivado */}
        <Header /* user={user} setUser={setUser} */ />

        {/* Rutas */}
        <main className="pt-5" style={{ paddingTop: "80px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />

            {/* 🔹 Se comenta la prop "user" en la ruta de administración */}
            <Route path="/admin" element={<Auth /* user={user} setUser={setUser} */ />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
        
        {/* Botón de scroll */}
        {showScrollButton && (
        <button className={`back-to-top ${showScrollButton ? "show" : ""}`} onClick={scrollToTop} title="Volver arriba">
            <IoIosArrowUp />
          </button>
        )}


      </div>
    </Router>
  );
};

// Footer condicional
const Footer = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/admin"; // Verifica si está en la página de autenticación para aplicar estilos

  return (
    <footer className={`text-light text-center py-3 ${isAuthPage ? "fixed-bottom" : ""}`} // Footer fijo en la página de autenticación
      style={{
        backgroundColor: isAuthPage ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.85)",
      }}
    >
      <p>&copy; 2025 D'Colors. Todos los derechos reservados.</p>
    </footer>
  );
};

// Página de Inicio
const Home = () => (
  <>
    {/* Hero Section */}
    <section id="home" className="vh-100 d-flex flex-column justify-content-center align-items-center text-center text-light bg-primary">
      <h2>Bienvenidos a D'Colors</h2>
      <p>Expresando arte a través del color</p>
    </section>

    {/* About Section */}
    <section className="container my-5" id="about">
      <h2 className="text-center">Sobre Nosotros</h2>
      <p className="text-center">Somos una empresa dedicada a la exhibición y venta de cuadros artísticos únicos.</p>
    </section>

    {/* Gallery Section */}
    <section id="gallery" className="bg-light py-5">
      <div className="container">
        <h2 className="text-center">Nuestra Galería</h2>
        <p className="text-center">Explora nuestras obras destacadas.</p>
        <Link to="/gallery" className="btn btn-dark align-center">
          Ver Galería
        </Link>
      </div>
    </section>

    {/* Contact Section */}
    <section id="contact" className="container my-5 text-center">
      <h2 className="mb-4">Contáctanos</h2>
      <p className="text-muted">Estamos disponibles para responder cualquier consulta.</p>

      <div className="d-flex flex-column flex-md-row justify-content-center gap-4 mt-4">

        {/* WhatsApp Contact */}
        <a href="https://wa.me/+34692688615" target="_blank" rel="noopener noreferrer"
          className="text-dark text-decoration-none d-flex align-items-center gap-2">
          <FaWhatsapp size={20} />
          <span>Escríbenos por WhatsApp</span>
        </a>

        {/* Teléfono Contact */}
        <div className="text-dark d-flex align-items-center gap-2">
          <FaPhone size={20} />
          <span>Llámanos ahora: <strong>+34 692 688 615</strong></span>
        </div>
      </div>
    </section>

  </>
);


export default App;
