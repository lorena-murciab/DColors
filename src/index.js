import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

/*
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByMHOcjQG3Ar-c6yjJsUr7cvoIt-RvzX0",
  authDomain: "dcolors-42d9c.firebaseapp.com",
  projectId: "dcolors-42d9c",
  storageBucket: "dcolors-42d9c.firebasestorage.app",
  messagingSenderId: "615157324858",
  appId: "1:615157324858:web:b66dbf6d715d01b7756903"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
*/