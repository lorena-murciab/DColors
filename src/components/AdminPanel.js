import React, { useState, useEffect } from "react";
// import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, db } from "../firebaseConfig"; // 🔹 Se comenta la importación de Firestore
import { useNavigate } from "react-router-dom";

const AdminPanel = ({ /* user */ }) => { // 🔹 Se comenta la recepción del usuario
  const [paintings, setPaintings] = useState([]);
  const [newPainting, setNewPainting] = useState({ title: "", category: "", size: "", imageUrl: "" });
  const navigate = useNavigate();

  // 🔹 Se comenta la función de carga de cuadros desde Firestore
  /*
  useEffect(() => {
    const fetchPaintings = async () => {
      const querySnapshot = await getDocs(collection(db, "paintings"));
      const paintingsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPaintings(paintingsList);
    };
    fetchPaintings();
  }, []);
  */

  // 🔹 Se comenta la función de añadir un cuadro
  /*
  const handleAddPainting = async () => {
    if (!newPainting.title || !newPainting.imageUrl) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    await addDoc(collection(db, "paintings"), newPainting);
    setNewPainting({ title: "", category: "", size: "", imageUrl: "" });
    alert("Cuadro añadido correctamente.");
    navigate("/gallery"); // Redirige a la galería
  };
  */

  // 🔹 Se comenta la función de eliminación de un cuadro
  /*
  const handleDeletePainting = async (id) => {
    await deleteDoc(doc(db, "paintings", id));
    alert("Cuadro eliminado correctamente.");
    setPaintings(paintings.filter((painting) => painting.id !== id));
  };
  */

  // Función de modificación de un cuadro
  // 🔹 Se comenta la función de modificación de un cuadro
  /*
  const handleEditPainting = async (id) => {
    const painting = paintings.find((painting) => painting.id === id);
    const newTitle = prompt("Introduce el nuevo título", painting.title);
    const newCategory = prompt("Introduce la nueva categoría", painting.category);
    const newSize = prompt("Introduce el nuevo tamaño", painting.size);
    const newImageUrl = prompt("Introduce la nueva URL de la imagen", painting.imageUrl);

    if (newTitle && newImageUrl) {
      await updateDoc(doc(db, "paintings", id), {
        title: newTitle,
        category: newCategory,
        size: newSize,
        imageUrl: newImageUrl,
      });
      alert("Cuadro modificado correctamente.");
      setPaintings(paintings.map((painting) => (painting.id === id ? { ...painting, title: newTitle, category: newCategory, size: newSize, imageUrl: newImageUrl } : painting)));
    }
  };
  */

  return (
    <div className="container my-5">
      <h2>Panel de Administración</h2>
      <div className="mb-4">
        <h3>Añadir nuevo cuadro</h3>
        <input
          type="text"
          placeholder="Título"
          value={newPainting.title}
          onChange={(e) => setNewPainting({ ...newPainting, title: e.target.value })}
          className="form-control mb-2"
        />
        <input
          type="text"
          placeholder="Categoría"
          value={newPainting.category}
          onChange={(e) => setNewPainting({ ...newPainting, category: e.target.value })}
          className="form-control mb-2"
        />
        <input
          type="text"
          placeholder="Tamaño"
          value={newPainting.size}
          onChange={(e) => setNewPainting({ ...newPainting, size: e.target.value })}
          className="form-control mb-2"
        />
        <input
          type="text"
          placeholder="URL de la imagen"
          value={newPainting.imageUrl}
          onChange={(e) => setNewPainting({ ...newPainting, imageUrl: e.target.value })}
          className="form-control mb-2"
        />
        {/* 🔹 Se desactiva el botón de añadir ya que la función está comentada */}
        {/* <button onClick={handleAddPainting} className="btn btn-primary">Añadir cuadro</button> */}
      </div>

      <h3>Lista de cuadros</h3>
      <ul className="list-group">
        {/* 🔹 Se comenta el renderizado de los cuadros ya que no hay datos */}
        {/* {paintings.map((painting) => (
          <li key={painting.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{painting.title}</strong> - {painting.category} ({painting.size})
            </div>
            <button onClick={() => handleDeletePainting(painting.id)} className="btn btn-danger">Eliminar</button>
          </li>
        ))} */}
      </ul>
    </div>
  );
};

export default AdminPanel;
