import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAX9kCzoY5H8lUAQFVJbOd9fYa4zx7zBhM",
    authDomain: "heal-hustler.firebaseapp.com",
    databaseURL: "https://heal-hustler-default-rtdb.firebaseio.com",
    projectId: "heal-hustler",
    storageBucket: "heal-hustler.appspot.com",
    messagingSenderId: "838200490111",
    appId: "1:838200490111:web:8d90db5a22ce7d30bae74a",
    measurementId: "G-KT009DHTJS"
  };

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const db_firestore = getFirestore(app);

export default app;

