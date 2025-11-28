import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3RYoWpeDPJCHFjqSqPSQSNKG3b0Fg35o",
  authDomain: "iacg-psychometric-test.firebaseapp.com",
  projectId: "iacg-psychometric-test",
  storageBucket: "iacg-psychometric-test.firebasestorage.app",
  messagingSenderId: "454584129092",
  appId: "1:454584129092:web:f55378cc175eaef923ce11"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and export it
export const db = getFirestore(app);