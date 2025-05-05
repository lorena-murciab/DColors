import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"; // Para manejar rutas
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
// import { FaWhatsapp, FaPhone } from "react-icons/fa"; // Importar iconos
import CategoriesPreview from "./components/CategoriesPreview";


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
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper d-flex flex-column min-vh-100">      
      {/* Header dinámico con autenticación */}
      <Header user={user} />

      {/* Rutas */}
      <main className="container-fluid p-0 flex-grow-1">
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
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 1000,
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "#e0a965",
            color: "white",
            border: "none",
            boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer"
          }}
        >
          <IoIosArrowUp size={20} />
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
      className="text-light text-center py-3 w-100"
      style={{
        backgroundColor: isAuthPage ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.85)",
        ...(isAuthPage ? { position: "fixed", bottom: 0, width: "100%" } : {})
      }}
    >
      <p className="mb-0">&copy; 2025 D'Colors. Todos los derechos reservados.</p>
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
    <section className="container my-4 my-md-5 px-3 px-md-0 text-center" id="about">
      <h2 className="mb-3">Sobre Nosotros</h2>
      <div className="mx-auto mb-4" style={{ width: '80px', height: '2px', background: '#e0a965' }} />
      <p className="text-muted mb-4 mb-md-5">Más de 30 años creando arte con alma</p>
      <div className="row">
        <div className="col-12 col-md-10 offset-md-1">
          <p className="text-start text-md-justify mb-4">
            Con más de <strong>30 años de experiencia</strong> en el sector, nos dedicamos a la <strong>creación, exposición y distribución de cuadros artísticos únicos</strong>, elaborados por nuestros propios artistas. Cada obra refleja un estilo personal, auténtico y exclusivo, pensado para emocionar y transformar cualquier espacio.
          </p>
          <p className="text-start text-md-justify mb-4">
            Nuestra empresa es <strong>referente nacional</strong> en el mundo del arte decorativo, con presencia en <strong>multitud de tiendas por toda España</strong> y capacidad de distribución en la <strong>Unión Europea</strong>. Gracias a nuestra red y logística, puedes disfrutar de nuestras obras estés donde estés.
          </p>
          <p className="text-start text-md-justify mb-4">
            Contamos con un equipo experto en <strong>asesoramiento artístico</strong>, dispuesto a ayudarte a encontrar el cuadro perfecto para tu hogar, negocio o colección. Disponemos de una gran variedad de estilos, formatos y temáticas, con la garantía de que cada pieza es <strong>original, exclusiva y de autor</strong>.
          </p>
          <p className="text-start text-md-justify">
            Si buscas <strong>arte con alma</strong>, creado por manos expertas y con distribución nacional e internacional, estás en el lugar adecuado.
          </p>
        </div>
      </div>
    </section>


    {/* Gallery Section */}
    <CategoriesPreview />

    {/* Contact Section */}
    {/* 
    <section id="contact" className="container my-4 my-md-5 px-3 px-md-0 text-center">
      <h2 className="mb-3">Contáctanos</h2>
      <div className="mx-auto mb-4" style={{ width: '80px', height: '2px', background: '#e0a965' }} />
      <p className="text-muted">Estamos disponibles para responder cualquier consulta.</p>

      <div className="d-flex flex-column flex-md-row justify-content-center gap-3 gap-md-4 mt-4">
        <a href="https://wa.me/+34692688615" target="_blank" rel="noopener noreferrer"
          className="text-dark text-decoration-none d-flex align-items-center justify-content-center gap-2 mb-3 mb-md-0">
          <FaWhatsapp size={20} />
          <span>Escríbenos por WhatsApp</span>
        </a>

        <div className="text-dark d-flex align-items-center justify-content-center gap-2">
          <FaPhone size={20} />
          <span>Llámanos: <strong>+34 692 688 615</strong></span>
        </div>
      </div>
    </section> */}
  </>
);


export default App;