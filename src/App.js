import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { auth, onAuthStateChanged, signOut  } from "./firebaseConfig"; // Escuchar cambios de autenticación
import Auth from "./components/Auth";
import Gallery from "./components/ImageGallery";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { IoIosArrowUp } from "react-icons/io";
import Header from "./components/Header"; // Nuevo Header dinámico



const App = () => {
  const [user, setUser] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Mostrar botón de scroll al llegar a cierta altura
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


  // Detectar si hay una sesión activa
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Guarda el usuario si está autenticado
    });
    return () => unsubscribe(); // Limpieza al desmontar
  }, []);

  return (
    <Router>
      <div>
        {/* Header */}
        <header className="bg-dark text-light py-3 fixed-top"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)", // Fondo negro con 60% de opacidad
          }}
        >
          <div className="container d-flex justify-content-between align-items-center">
            <Link to="/">
              <img src="/logo_inicio1.png" alt="D'Colors Logo" className="img-fluid" style={{ height: "50px" }} />
            </Link>
            <nav>
              <Link to="/gallery" className="btn btn-outline-light mx-2">
                Galería
              </Link>
              {/* Botón de cerrar sesión solo si el usuario está autenticado */}
              {user && (
                <button className="btn btn-danger mx-2" onClick={() => signOut(auth) && setUser(null)}>
                  Cerrar sesión
                </button>
              )}
            </nav>
          </div>
        </header>

        {/* Rutas */}
        <main className="pt-5" style={{ paddingTop: "80px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/admin" element={<Auth user={user} setUser={setUser} />} />
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
  const isAuthPage = location.pathname === "/admin";

  return (
    <footer className={`text-light text-center py-3 ${isAuthPage ? "fixed-bottom" : ""}`}
      style={{
        backgroundColor: isAuthPage ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.85)", // Fondo transparente solo en Auth
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
    <section id="contact" className="container my-5">
      <h2 className="text-center">Contacto</h2>
      <p className="text-center">Para consultas, contáctanos en contacto@dcolors.com</p>
    </section>
  </>
);


export default App;
