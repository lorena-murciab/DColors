import { createContext, useContext, useState, useEffect } from "react";
import { auth, onAuthStateChanged, signOut } from "../firebaseConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carga


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Actualiza el estado global del usuario
      setLoading(false); // Una vez obtenido el usuario, quitamos la carga
      console.log("Usuario actualizado en contexto:", currentUser);
    });

    return () => unsubscribe(); // Limpia el listener al desmontar
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {!loading && children} {/* No renderiza nada hasta que carga el usuario */}
      </AuthContext.Provider>
  );
};

// Hook para acceder al contexto en cualquier parte de la app
export const useAuth = () => useContext(AuthContext);
