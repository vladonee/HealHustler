import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

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

const submit = document.getElementById('submitSignin');

submit.addEventListener("click", function(event){
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const full_name = document.getElementById('name').value;
  const privilege = "doctor";

  localStorage.setItem('loggingIn', 'true');

  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;
    const reference = ref(database, 'users/' + user.uid);

    set(reference, {
      email : email,
      full_name : full_name,
      privilege : privilege,
    })
    .then(() => {
      alert('User creat!');
      localStorage.removeItem('loggingIn');
      window.location.href = "home.html";
    })
    .catch((error) => {
      alert('Nu s-a putut crea contul');
      localStorage.removeItem('loggingIn');
      console.log(error);
    })
  })
  .catch((error) => {
    localStorage.removeItem('loggingIn');
    const errorCode = error.code;
    const errorMessage = error.message;
    
    alert(errorMessage);
  });
})