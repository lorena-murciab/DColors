import React, { useState } from "react";
import { auth, signInWithEmailAndPassword } from "../firebaseConfig";
import { useAuth } from "./AuthContext"; // Importar el hook de autenticación
import { /* useNavigate, */ Link } from "react-router-dom";
import "../App.css";


const LoginAdmin = () => {
  const { user } = useAuth(); // Obtenemos el usuario del contexto
  // const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [inputError, setInputError] = useState(false);


  const login = async () => {
    if (!email || !password) {
      setError("Debes completar todos los campos.");
      setInputError(true); // Activa el borde rojo
      return;
    } 

    // Iniciar sesión
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // navigate("/gallery"); // Redirige tras iniciar sesión
    } catch (err) {
      console.error("Error en login:", err);
      setError("Credenciales incorrectas.");
      setInputError(true);
    }
  };

  return (
    <div className="position-relative vh-100">
      {/* Fondo Animado */}
      <div className="auth-background"></div>
  
      {/* Contenedor Principal */}
      <div
        className="vh-100 d-flex justify-content-center align-items-center position-relative"
        style={{
          zIndex: 1, // Para que el contenido esté sobre el fondo
        }}
      >
        <div
          className="text-white p-4 text-center w-100"
          style={{ maxWidth: "700px", background: "rgba(0, 0, 0, 0.34)", borderRadius: "25px", backdropFilter: "blur(3px)" }}
        >

          {/* Si hay usuario le da la bienvenida, sino muestra el formulario */}
          {user ? (
            <>
              <p className="mb-3">¡Bienvenido, {user.email}!</p>
              <p>
                <Link to="/gallery" className="text-white">
                  <u>Ya puedes acceder a la galería para realizar modificaciones.</u>
                </Link>
              </p>
            </>
          ) : (
            <div>
              <h2 className="mb-3">Inicio de sesión</h2>
              <p>¿Eres un administrador?</p>
              <div className="container d-flex justify-content-center">
                <div className="col-md-6">
                  <input
                    type="email"
                    placeholder="Correo"
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && login()} // Detectar Enter
                    className={`form-control my-3 ${inputError ? "is-invalid" : ""}`}
                    style={{ borderColor: "#ff5733" }}
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && login()} // Detectar Enter
                    className={`form-control my-3 ${inputError ? "is-invalid" : ""}`}
                    style={{ borderColor: "#ff5733" }}
                  />
                </div>
              </div>
  
              <button className="btn custom-btn m-2" onClick={login}>
                Iniciar sesión
              </button>
              <div style={{ minHeight: "20px" }}>
                {error && <p className="text-danger">{error}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
};

export default LoginAdmin;
