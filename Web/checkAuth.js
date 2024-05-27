import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

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
const database = getDatabase();

const paragraph = document.getElementById("text");

const monitorAuthState = async () => {
  onAuthStateChanged(auth, user => {
    if (user) {
      const userId = user.uid;
      const reference = ref(database);

      get(child(reference, `users/${userId}`)).then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          if (userData.privilege == 'admin') {
            if (!localStorage.getItem('loggingIn')) {
              alert('Sunteți deja conectat');
            }
            window.location.href = "adminView.html";
  
          } else if (userData.privilege == 'doctor') {
            if (!localStorage.getItem('loggingIn')) {
              alert('Sunteți deja conectat');
            }
            window.location.href = "home.html";
  
          }
        }
      }).catch((error) => {
        console.error(error);
      }).finally(() => {
        localStorage.removeItem('loggingIn');
      });
    }
  })
}

monitorAuthState();