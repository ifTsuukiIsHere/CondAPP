// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYppQu7Bc0egxIdqwxJxRF1ITu6OIsdMM",
  authDomain: "condapp-ff394.firebaseapp.com",
  projectId: "condapp-ff394",
  storageBucket: "condapp-ff394.firebasestorage.app",
  messagingSenderId: "566837944486",
  appId: "1:566837944486:web:88bd47a94cbec7eacc9467"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const environment={
  firebaseConfig
};