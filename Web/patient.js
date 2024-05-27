import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs, addDoc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

// Function to get query parameter by name
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Function to fetch and display patient data
async function fetchPatientData(patientId) {
  const patientDoc = await getDoc(doc(db, "Patient", patientId));
  const patientDetailsElement = document.getElementById('patient-details');

  if (patientDoc.exists()) {
    const data = patientDoc.data();
    patientDetailsElement.innerHTML = `
      <div class="patient">
        <p id="patient_name"><b>Nume:</b> ${data.Last_Name} ${data.First_Name}</p>
        <p><b>Email:</b> ${data.Email}</p>
        <p><b>Varsta:</b> ${data.Age}</p>
        <p><b>CNP:</b> ${data.CNP}</p>
        <p><b>Adresa:</b> ${data.Country}, ${data.County}, ${data.City}, Str. ${data.Street}, Nr. ${data.Street_Number}, Bl. ${data.Apartment_Building}, Ap. ${data.Apartment}</p>
        <p><b>Nr. tel.:</b> ${data.Phone}</p>
        <p><b>Profesie:</b> ${data.Job}</p>
        <p><b>Loc de munca:</b> ${data.Workplace}</p>
        <p><b>Diagnostic:</b> ${data.Diagnosis}</p>
        <p><b>Alte observatii:</b> ${data.Other_Observations}</p>
        <p><b>Coridor:</b> ${data.Corridor}</p>
        <p><b>Salon:</b> ${data.Room_Number}</p>
        <p><b>Pat:</b> ${data.Bed_Number}</p>
      </div>
    `;
    document.getElementById('medicine-order-container').style.display = 'flex';
    document.getElementById('medicine-order-container').style.flexDirection = 'column';
    fetchMedicines();
    fetchMedicineOrders(data.Last_Name, data.First_Name); // Fetch medicine orders for the patient
  } else {
    patientDetailsElement.innerHTML = '<p>Pacientul nu a fost găsit.</p>';
  }
}

// Function to fetch and populate medicines
async function fetchMedicines() {
  const medicinesCollection = collection(db, "Medicine");
  const medicinesSnapshot = await getDocs(medicinesCollection);
  const medicineSelect = document.getElementById('medicine-select');
  medicineSelect.innerHTML = ''; // Clear previous options

  medicinesSnapshot.forEach((doc) => {
    const medicine = doc.data();

    if (medicine.Stock > 0) {
      const option = document.createElement('option');
      option.value = medicine.Name;
      option.textContent = medicine.Name;
      medicineSelect.appendChild(option);
    }
  });
}

// Function to fetch and display medicine orders
async function fetchMedicineOrders(lastName, firstName) {
  const ordersQuery = query(collection(db, "Medicine_transportation"),
    where("Patient_Last_Name", "==", lastName),
    where("Patient_First_Name", "==", firstName)
  );
  const ordersSnapshot = await getDocs(ordersQuery);
  const ordersList = document.getElementById('orders-list');
  ordersList.innerHTML = ''; // Clear previous orders
  
  if (ordersSnapshot.empty) {
    const listItem = document.createElement('li');
    listItem.textContent = 'Nu există comenzi de medicamente pentru acest pacient.';
    ordersList.appendChild(listItem);
  } else {
    ordersSnapshot.forEach((doc) => {
      const order = doc.data();
      const listItem = document.createElement('li');
      listItem.textContent = `${order.Medicine_Name} - Data și ora plasării comenzii: ${order.Order_Date.toDate().toLocaleString()}`;
      ordersList.appendChild(listItem);
    });
  }
}

// Function to refresh medicine list and orders
async function refreshData(lastName, firstName) {
  fetchMedicines();
  fetchMedicineOrders(lastName, firstName);
}

// Function to handle medicine order
async function handleMedicineOrder(patientId) {
  const medicineSelect = document.getElementById('medicine-select');
  const selectedMedicineName = medicineSelect.value;
  
  if (!selectedMedicineName) {
    alert("Vă rugăm să selectați un medicament.");
    return;
  }
  
  const patientDoc = await getDoc(doc(db, "Patient", patientId));
  if (patientDoc.exists()) {
    const patientData = patientDoc.data();

    // Query to get the medicine document by name
    const medicineQuery = query(collection(db, "Medicine"),
      where("Name", "==", selectedMedicineName)
    );
    const medicineSnapshot = await getDocs(medicineQuery);

    if (!medicineSnapshot.empty) {
      const medicineDoc = medicineSnapshot.docs[0];
      const medicineData = medicineDoc.data();
      const orderDate = new Date();

      // Add order to Medicine_transportation
      await addDoc(collection(db, "Medicine_transportation"), {
        Patient_Last_Name: patientData.Last_Name,
        Patient_First_Name: patientData.First_Name,
        Patient_Room_Number: patientData.Room_Number,
        Patient_Bed_Number: patientData.Bed_Number,
        Patient_Corridor: patientData.Corridor,
        Medicine_Name: medicineData.Name,
        Order_Date: orderDate
      });
      
      // Decrement the stock of the medicine
      await updateDoc(doc(db, "Medicine", medicineDoc.id), {
        Stock: medicineData.Stock - 1
      });

      // Add order to Command collection
      await addDoc(collection(db, "Command"), {
        End_Date: "-",
        Order_Status: "Ongoing",
        Ordered_Medication: medicineData.Name,
        Patient_First_Name: patientData.First_Name,
        Patient_Last_Name: patientData.Last_Name,
        Placement_Date: orderDate
      });

      // Refresh the data
      refreshData(patientData.Last_Name, patientData.First_Name);

      alert("Comanda a fost plasată cu succes.");
    } else {
      alert("Medicamentul nu a fost găsit.");
    }
  } else {
    alert("Pacientul nu a fost găsit.");
  }
}

// Get patient ID from URL and fetch patient data
const patientId = getQueryParam('id');
if (patientId) {
  fetchPatientData(patientId);
} else {
  document.getElementById('patient-details').innerHTML = '<p>ID pacient lipsă în URL.</p>';
}

// Add event listener for the medicine order button
document.getElementById('med-command-btn').addEventListener('click', () => handleMedicineOrder(patientId));