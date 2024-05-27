import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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
const db = getFirestore(app);

// Function to fetch and display all commands
async function fetchCommands() {
  const commandsCollection = collection(db, "Command");
  const commandsSnapshot = await getDocs(commandsCollection);
  const textElement = document.getElementById('text');
  textElement.innerHTML = ''; // Clear previous content

  if (commandsSnapshot.empty) {
    textElement.innerHTML = '<p>Nu există comenzi înregistrate.</p>';
  } else {
    commandsSnapshot.forEach((doc) => {
      const command = doc.data();
      const commandInfo = `
        <div class="command-info">
          <div id="command-additional-info">
            <div id="patient_name">${command.Patient_Last_Name} ${command.Patient_First_Name}</div>
          </div>
          <div id="command-additional-info">
            <p><b>Medicament:</b> ${command.Ordered_Medication}</p>
            <p><b>Status:</b> ${command.Order_Status}</p>
            <p><b>Data plasării:</b> ${command.Placement_Date.toDate().toLocaleString()}</p>
            <p><b>Data finalizării:</b> ${command.End_Date === "-" ? "-" : command.End_Date.toDate().toLocaleString()}</p>
          </div>
          <hr>
        </div>
      `;
      textElement.innerHTML += commandInfo;
    });
  }
}

// Call fetchCommands on load
fetchCommands();