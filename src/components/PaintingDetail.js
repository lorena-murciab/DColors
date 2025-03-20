import React, { useState } from "react";
// import { db, doc, updateDoc } from "../firebaseConfig"; // 🔹 Se comenta Firestore

const PaintingDetail = ({ painting, user, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPainting, setEditedPainting] = useState({ ...painting });

  // 🔹 Se comenta la función de guardado en Firestore
  /*
  const handleSave = async () => {
    await updateDoc(doc(db, "paintings", painting.id), editedPainting);
    setIsEditing(false);
    alert("Cambios guardados correctamente.");
  };
  */

  return (
    <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{painting.title}</h5>
            <button onClick={onClose} className="btn-close"></button>
          </div>
          <div className="modal-body">
            <img src={painting.imageBase64} alt={painting.title} className="img-fluid" />
            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={editedPainting.title}
                  onChange={(e) => setEditedPainting({ ...editedPainting, title: e.target.value })}
                  className="form-control mb-2"
                />
                <input
                  type="text"
                  value={editedPainting.category}
                  onChange={(e) => setEditedPainting({ ...editedPainting, category: e.target.value })}
                  className="form-control mb-2"
                />
                <input
                  type="text"
                  value={editedPainting.size}
                  onChange={(e) => setEditedPainting({ ...editedPainting, size: e.target.value })}
                  className="form-control mb-2"
                />
                {/* 🔹 Se desactiva el botón de guardar ya que Firestore está comentado */}
                {/* <button onClick={handleSave} className="btn btn-primary">
                  Guardar
                </button> */}
              </div>
            ) : (
              <div>
                <p><strong>Categoría:</strong> {painting.category}</p>
                <p><strong>Tamaño:</strong> {painting.size}</p>
                {user && (
                  <button onClick={() => setIsEditing(true)} className="btn btn-warning">
                    Editar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaintingDetail;
