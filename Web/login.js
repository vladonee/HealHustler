import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
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

const submit = document.getElementById('submitLogin');

submit.addEventListener("click", function(event){
  event.preventDefault();
  localStorage.setItem('loggingIn', 'true');
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;
    const userId = user.uid;
    const reference = ref(database);

    get(child(reference, `users/${userId}`)).then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.privilege == 'admin') {
          alert('Cont de administrator conectat');
          window.location.href = "adminView.html";

        } else if (userData.privilege == 'doctor') {
          alert('Cont de doctor conectat');
          window.location.href = "home.html";

        } else {
          alert("Nu vă puteți conecta cu acest cont");
          signOut(auth).then(() => {
            // Sign-out successful.
            localStorage.removeItem('loggingIn');
          }).catch((error) => {
            localStorage.removeItem('loggingIn');
            const errorCode1 = error.code;
            const errorMessage1 = error.message;
            
            alert(errorMessage1);
          });
          window.location.href = "login.html";
        }
      } else {
        alert("Utilizator invalid!");
        signOut(auth).then(() => {
          // Sign-out successful.
          localStorage.removeItem('loggingIn');
        }).catch((error) => {
          localStorage.removeItem('loggingIn');
          const errorCode2 = error.code;
          const errorMessage2 = error.message;
          
          alert(errorMessage2);
        });
        window.location.href = "login.html";
      }
    }).catch((error) => {
      console.error(error);
      localStorage.removeItem('loggingIn');
    });
  })
  .catch((error) => {
    localStorage.removeItem('loggingIn');
    const errorCode = error.code;
    const errorMessage = error.message;
    
    alert(errorMessage);
  });
})