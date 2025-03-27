import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, getDocs, doc, updateDoc, deleteDoc, limit, serverTimestamp } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyByMHOcjQG3Ar-c6yjJsUr7cvoIt-RvzX0",
    authDomain: "dcolors-42d9c.firebaseapp.com",
    projectId: "dcolors-42d9c",
    storageBucket: "dcolors-42d9c.firebasestorage.app",
    messagingSenderId: "615157324858",
    appId: "1:615157324858:web:b66dbf6d715d01b7756903"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
    signOut, onAuthStateChanged, collection, addDoc, query, orderBy, onSnapshot, 
    getDocs, doc, updateDoc, deleteDoc, limit, serverTimestamp };
