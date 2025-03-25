import React, { useState } from "react";
import { db, collection, addDoc } from "../firebaseConfig";
// import { useAuth } from "./AuthContext"; 


const UploadPaintingModal = ({ onClose,  onUpload }) => {
  // const { user } = useAuth(); // Obtenemos el usuario del contexto
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = React.createRef();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile(reader.result); // Guarda la imagen en Base64
      };
      reader.readAsDataURL(selectedFile); // Convierte la imagen a Base64
    }
  };

  const handleUpload = async () => {
    if (!title || !category || !size || !file) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    setIsUploading(true);

    try {
      // Guardar los datos en Firestore
      await addDoc(collection(db, "paintings"), {
        title,
        category,
        size,
        imageBase64: file, // Guarda la imagen en Base64
        createdAt: new Date()
      });

      alert("Cuadro subido correctamente.");
      onUpload(); // Cerrar el modal y recargar la galería
      onClose(); 

    } catch (error) {
      console.error("Error subiendo el cuadro:", error);
      alert("Hubo un error al subir el cuadro.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Subir Cuadro</h5>
            <button onClick={onClose} className="btn-close"></button>
          </div>
          <div className="modal-body">
            <input
              type="text"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control mb-2"
            />
            <input
              type="text"
              placeholder="Categoría"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-control mb-2"
            />
            <input
              type="text"
              placeholder="Tamaño"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="form-control mb-2"
            />
            {/* Botón para seleccionar archivo */}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="d-none"
            />
            <button
            className="btn btn-secondary mb-2"
            onClick={() => fileInputRef.current.click()}
            >
              Seleccionar imagen
            </button>
            {/* Vista previa de la imagen seleccionada */}
            {file && (
              <div className="text-center">
                <img src={file} alt="Vista previa" className="img-fluid mt-2" style={{ maxHeight: "200px" }} />
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button onClick={handleUpload} className="btn btn-primary" disabled={isUploading}>
              {isUploading ? "Subiendo..." : "Subir"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPaintingModal;
