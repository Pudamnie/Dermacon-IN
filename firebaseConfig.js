import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB9Z9CyqichtFG4X_KP8zL7j_jqwiybWts",
  authDomain: "dermacareai.firebaseapp.com",
  projectId: "dermacareai",
  storageBucket: "dermacareai.firebasestorage.app",
  messagingSenderId: "66258486304",
  appId: "1:66258486304:web:8e6db1d9d468aa420b6845",
  measurementId: "G-H3W80FHLB0"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);