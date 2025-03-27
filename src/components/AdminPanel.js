import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "../firebaseConfig";

const AdminPanel = () => {
  const [paintings, setPaintings] = useState([]);
  const [newPainting, setNewPainting] = useState({ title: "", category: "", size: "", imageBase64: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  // Cargar cuadros desde Firestore
  useEffect(() => {
    const fetchPaintings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "paintings"));
        const paintingsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPaintings(paintingsList);
      } catch (error) {
        console.error("Error al cargar los cuadros:", error);
      }
    };
    fetchPaintings();
  }, []);

  // Convertir imagen a webp y comprimirla
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.src = event.target.result;
  
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
  
        // Reducir tamaño manteniendo relación de aspecto
        const maxWidth = 1200;
        const maxHeight = 1200;
        let width = img.width;
        let height = img.height;
  
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height *= maxWidth / width;
            width = maxWidth;
          } else {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
  
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
  
        // Convertir a WebP y comprimir
        canvas.toBlob(
          (blob) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              const webpBase64 = reader.result;
              setSelectedFile(webpBase64);
              setNewPainting({ ...newPainting, imageBase64: webpBase64 });
            };
          },
          "image/webp",
          0.85 // Calidad de compresión (entre 0 y 1)
        );
      };
    };
    reader.readAsDataURL(file);
  };
  

  // Subir cuadro a Firestore
  const handleAddPainting = async () => {
    if (!newPainting.title || !newPainting.imageBase64) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    
    setIsUploading(true);

    try {
      const paintingData = {
        ...newPainting,
        timestamp: serverTimestamp(), // 🔹 Agregar la fecha de subida
      };
  
      const docRef = await addDoc(collection(db, "paintings"), paintingData);
      setPaintings([...paintings, { id: docRef.id, ...paintingData }]);
  
      setNewPainting({ title: "", category: "", size: "", imageBase64: "" });
      setSelectedFile(null);
  
      alert("Cuadro añadido correctamente.");
      navigate("/gallery");
    } catch (error) {
      console.error("Error al añadir cuadro:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Editar cuadro
  const handleEditPainting = async (id) => {
    const painting = paintings.find((p) => p.id === id);
    const newTitle = prompt("Nuevo título:", painting.title);
    const newCategory = prompt("Nueva categoría:", painting.category);
    const newSize = prompt("Nuevo tamaño:", painting.size);
    
    if (newTitle && newCategory && newSize) {
      try {
        await updateDoc(doc(db, "paintings", id), {
          title: newTitle,
          category: newCategory,
          size: newSize,
        });

        setPaintings(paintings.map((p) => (p.id === id ? { ...p, title: newTitle, category: newCategory, size: newSize } : p)));
        alert("Cuadro modificado correctamente.");
      } catch (error) {
        console.error("Error al editar cuadro:", error);
      }
    }
  };

  // Eliminar cuadro
  const handleDeletePainting = async (id) => {
    try {
      await deleteDoc(doc(db, "paintings", id));
      setPaintings(paintings.filter((p) => p.id !== id));
      alert("Cuadro eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar cuadro:", error);
    }
  };

  return (
    <div className="container my-5">
      <h2>Panel de Administración</h2>

      {/* Formulario para añadir cuadros */}
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

        {/* Input oculto y botón para seleccionar imagen */}
        <input type="file" accept="image/*" onChange={handleFileChange} className="d-none" id="fileInput" />
        <button className="btn btn-secondary mb-2" onClick={() => document.getElementById("fileInput").click()}>
          Seleccionar imagen
        </button>

        {/* Vista previa de la imagen */}
        {selectedFile && (
          <div className="text-center">
            <img src={selectedFile} alt="Vista previa" className="img-fluid mt-2" style={{ maxHeight: "200px" }} />
          </div>
        )}

        <button onClick={handleAddPainting} className="btn btn-primary mt-3" disabled={isUploading}>
            {isUploading ? "Subiendo..." : "Añadir cuadro"}
          </button>
        </div>

      {/* Lista de cuadros */}
      <h3>Lista de cuadros</h3>
      <ul className="list-group">
        {paintings.map((painting) => (
          <li key={painting.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{painting.title}</strong> - {painting.category} ({painting.size})
            </div>
            {painting.imageBase64 && (
              <img src={painting.imageBase64} alt={painting.title} style={{ width: "50px", height: "50px", objectFit: "cover" }} />
            )}
            <div>
              <button onClick={() => handleEditPainting(painting.id)} className="btn btn-warning me-2">Editar</button>
              <button onClick={() => handleDeletePainting(painting.id)} className="btn btn-danger">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;