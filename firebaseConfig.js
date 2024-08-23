import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-storage.js';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCe3jK1jpK0gzVhXWUnQb61nG47yoIT3-g",
    authDomain: "yuvaganesh-youth.firebaseapp.com",
    databaseURL: "https://yuvaganesh-youth-default-rtdb.firebaseio.com",
    projectId: "yuvaganesh-youth",
    storageBucket: "yuvaganesh-youth.appspot.com",
    messagingSenderId: "217524328069",
    appId: "1:217524328069:web:2ef02302ca5579a8cdbbec",
    measurementId: "G-MEE96BCLZW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage, collection, addDoc, serverTimestamp, query, orderBy, getDocs, ref, uploadBytes, getDownloadURL };
