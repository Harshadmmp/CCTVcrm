import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5waGZ7Psm-j0f1zhur9D3-9Br1EbWv5A",
  authDomain: "cctv-crm.firebaseapp.com",
  projectId: "cctv-crm",
  storageBucket: "cctv-crm.firebasestorage.app",
  messagingSenderId: "378076955464",
  appId: "1:378076955464:web:34379a21b3615ddc01297d",
  measurementId: "G-13R79V71HK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

