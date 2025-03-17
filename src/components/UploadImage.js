import React, { useState } from "react";
import { db, addDoc, collection } from "../firebaseConfig";

const UploadImage = ({ user }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!image) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64String = reader.result;

      try {
        await addDoc(collection(db, "images"), {
          image: base64String,
          createdAt: new Date(),
          user: user.email,
        });

        setImage(null);
      } catch (error) {
        console.error("Error al subir la imagen:", error);
      }

      setLoading(false);
    };

    reader.readAsDataURL(image);
  };

  return (
    <div className="mt-4">
      <input type="file" onChange={(e) => setImage(e.target.files[0])} />
      <button className="btn btn-success mt-2" onClick={handleUpload} disabled={loading}>
        {loading ? "Subiendo..." : "Subir imagen"}
      </button>
    </div>
  );
};

export default UploadImage;
