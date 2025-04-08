import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom"; // Para manejar rutas
import { AuthProvider, useAuth } from "./components/AuthContext";
import { onAuthStateChanged, auth } from "./firebaseConfig"; // Importar la función de autenticación

// Componentes de la app
import LoginAdmin from "./components/LoginAdmin"; // Página de login
import Gallery from "./components/ImageGallery"; // Galería de cuadros
import Header from "./components/Header"; // Header dinámico
import AdminPanel from "./components/AdminPanel"; // Panel de administración
import LatestPaintings from "./components/LatestPaintings"; // Importa el componente de las últimas pinturas

// Estilos
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Iconos
import { IoIosArrowUp } from "react-icons/io";
import { FaWhatsapp, FaPhone } from "react-icons/fa"; // Importar iconos


const App = () => {
  const [showScrollButton, setShowScrollButton] = useState(false); // Estado para mostrar botón de scroll

  // Por consola vemos el nombre del usuario autenticado
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      console.log("Usuario autenticado:", user?.email);
    });
  }, []);

  // Botón de scroll rápido al llegar a cierta altura
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppContent showScrollButton={showScrollButton} />
      </Router>
    </AuthProvider>
  );
};

// 🟢 Mueve el contenido de la app aquí para evitar re-render innecesarios
const AppContent = ({ showScrollButton }) => {
  const { user, loading } = useAuth(); // Obtiene el usuario del contexto

  // Mientras carga el usuario, mostramos un "cargando..."
  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>      {/* Header dinámico con autenticación */}
      <Header user={user} />

      {/* Rutas */}
      <main 
      className="container-fluid p-0 "
      style={{ flex: 1 }} // Para que ocupe el espacio restante
      >
        {/* Rutas de la app */}
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/admin" element={user ? <AdminPanel /> : <Navigate to="/login" />} />
          {/* <Route path="/admin" element={<AdminPanel />} /> */}
          <Route path="/login" element={<LoginAdmin />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Botón de scroll */}
      {showScrollButton && (
        <button
          className="back-to-top show"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          title="Volver arriba"
        >
          <IoIosArrowUp />
        </button>
      )}
    </div>
  );
};

// Footer condicional
const Footer = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login";

  return (
    <footer
      className="text-light text-center py-3"
      style={{
        backgroundColor: isAuthPage ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.85)",
        ...(isAuthPage ? { position: "fixed", bottom: 0, width: "100%" } : {})
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
    <section id="home">
      <LatestPaintings />
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
