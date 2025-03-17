import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

const Header = ({ user, setUser }) => {
  const [showMinimalHeader, setShowMinimalHeader] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowMinimalHeader(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Header inicial grande */}
      {!showMinimalHeader && (
        <header className="big-header">
          <div className="container text-center">
            <img src="/logo_inicio1.png" alt="D'Colors Logo" className="big-logo" />
            <h1>Bienvenidos a D'Colors</h1>
            <p>Expresando arte a través del color</p>
          </div>
        </header>
      )}

      {/* Header minimalista fijo */}
      <header className={`mini-header ${showMinimalHeader ? "show" : ""}`}>
        <div className="container d-flex justify-content-between align-items-center">
          <Link to="/">
            <img src="/logo_inicio1.png" alt="D'Colors Logo" className="mini-logo" />
          </Link>
          <nav>
            <Link to="/gallery" className="btn btn-outline-light mx-2">
              Galería
            </Link>
            {user && (
              <button className="btn btn-danger mx-2" onClick={() => signOut(auth) && setUser(null)}>
                Cerrar sesión
              </button>
            )}
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
