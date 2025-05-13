// Archivo de ejemplo para la configuración de Firebase
// Renombra este archivo a firebaseConfig.js y añade tus credenciales

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, getDocs, getDoc, doc, updateDoc, deleteDoc, limit, serverTimestamp } from "firebase/firestore";

// Reemplaza con tus propias credenciales de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID",
  measurementId: "TU_MEASUREMENT_ID"
};

// Inicializar Firebase

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
    signOut, onAuthStateChanged, collection, addDoc, query, orderBy, onSnapshot, 
    getDocs, getDoc, doc, updateDoc, deleteDoc, limit, serverTimestamp };