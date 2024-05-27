import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAX9kCzoY5H8lUAQFVJbOd9fYa4zx7zBhM",
  authDomain: "heal-hustler.firebaseapp.com",
  projectId: "heal-hustler",
  storageBucket: "heal-hustler.appspot.com",
  messagingSenderId: "838200490111",
  appId: "1:838200490111:web:8d90db5a22ce7d30bae74a",
  measurementId: "G-KT009DHTJS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const submit = document.getElementById('logout-button');

submit.addEventListener("click", function() {
  localStorage.setItem('loggingOut', 'true');
  signOut(auth).then(() => {
    // Sign-out successful.
    localStorage.removeItem('loggingOut');
    window.location.href = "login.html";
  }).catch((error) => {
    localStorage.removeItem('loggingOut');
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage);
  })
})
