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
async function fetchAlarms() {
  const alarmsCollection = collection(db, "Alarm");
  const alarmsSnapshot = await getDocs(alarmsCollection);
  const textElement = document.getElementById('text');
  textElement.innerHTML = ''; // Clear previous content

  if (alarmsSnapshot.empty) {
    textElement.innerHTML = '<p>Nu există alarme generate.</p>';
  } else {
    alarmsSnapshot.forEach((doc) => {
      const alarm = doc.data();
      const alarmInfo = `
        <div class="alarm-info">
          <div id="alarm-additional-info">
            <p><b>Mesaj alarma:</b> ${alarm.Message}</p>
            <p><b>Ora generării acesteia:</b> ${alarm.Time_Stamp.toDate().toLocaleString()}</p>
          </div>
          <hr>
        </div>
      `;
      textElement.innerHTML += alarmInfo;
    });
  }
}

// Call fetchAlarms on load
fetchAlarms();