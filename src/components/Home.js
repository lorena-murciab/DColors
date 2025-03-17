import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Gallery from "./components/ImageGallery";

const Home = () => {
  return (
    <div>
      {/* Header */}
      <header className="bg-dark text-light py-3 fixed-top">
        <div className="container d-flex justify-content-between align-items-center">
          <h1 className="h3">D'Colors</h1>
          <nav>
            <a href="#home" className="btn btn-outline-light mx-2">Inicio</a>
            <a href="#gallery" className="btn btn-outline-light mx-2">Galería</a>
            <a className="btn btn-dark" href="#admin">¿Eres un administrador?</a>
          </nav>
        </div>
      </header>

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
          {/* Aquí puedes agregar el componente de galería */}
          
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container my-5">
        <h2 className="text-center">Contacto</h2>
        <p className="text-center">Para consultas, contáctanos en contacto@dcolors.com</p>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-light text-center py-3">
        <p>&copy; 2024 D'Colors. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Home;
