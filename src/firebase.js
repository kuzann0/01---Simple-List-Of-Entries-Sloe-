import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAlNXIH9faqC6h2xxHiAFve6POq4VWd7j4",
  authDomain: "simple-list-of-entries-8a368.firebaseapp.com",
  projectId: "simple-list-of-entries-8a368",
  storageBucket: "simple-list-of-entries-8a368.firebasestorage.app",
  messagingSenderId: "357771771097",
  appId: "1:357771771097:web:5d4231996a8288cd4492c8",
  measurementId: "G-EQMWT59V8T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
