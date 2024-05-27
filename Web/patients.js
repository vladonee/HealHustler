import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc, query, where, or, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

// Function to fetch data from Firestore
async function fetchData(searchQuery = "") {
  const collectionRef = collection(db, "Patient");
  let querySnapshot;

  if (searchQuery) {
    const q = query(collectionRef, 
      or(
        where("Last_Name", "==", searchQuery),
        where("First_Name", "==", searchQuery)
      )
    );
    querySnapshot = await getDocs(q);
  } else {
    querySnapshot = await getDocs(collectionRef);
  }

  const textElement = document.getElementById('text');
  textElement.innerHTML = ''; // Clear the initial content

  if (querySnapshot.empty) {
    // Display message when no patients are found
    textElement.innerHTML = '<p>No patients found.</p>';
  } else {
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const patientInfo = `
        <div class="patient">
          <div id="patients_additional_info">
            <a id="patient_name" href="patient.html?id=${doc.id}">${data.Last_Name} ${data.First_Name}</a>
            <div id="btn-edit-del-container">
              <button class="delete-button" data-id="${doc.id}">Delete</button>
              <button class="edit-button" data-id="${doc.id}">Edit</button>
            </div>
          </div>
          <div id="patients_additional_info">
            <p><b>Email:</b> ${data.Email}</p>
            <p><b>CNP:</b> ${data.CNP}</p>
            <p><b>Nr. tel.:</b> ${data.Phone}</p>
            <p><b>Coridor:</b> ${data.Corridor}</p>
            <p><b>Salon:</b> ${data.Room_Number}</p>
            <p><b>Pat:</b> ${data.Bed_Number}</p>
          </div>
          <hr>
        </div>
      `;

      textElement.innerHTML += patientInfo;
    });

    // Add event listeners for edit buttons
    const editButtons = document.querySelectorAll('.edit-button');
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        const patientId = button.dataset.id;
        openEditForm(patientId);
      });
    });

    // Add event listeners for delete buttons
    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const patientId = button.dataset.id;
        deletePatient(patientId);
      });
    });
  }
}

// Function to delete patient from Firestore
async function deletePatient(patientId) {
  try {
    const patientRef = doc(db, 'Patient', patientId);
    await deleteDoc(patientRef);
    console.log("Document successfully deleted!");
    // Refresh the patient list after deletion
    fetchData();
  } catch (error) {
    console.error("Error deleting document: ", error);
  }
}

// Function to open edit form and populate with patient data
async function openEditForm(patientId) {
  const editPatientForm = document.getElementById('edit-patient-form');
  editPatientForm.classList.remove('hidden');

  // Populate form with patient data for editing
  const patientRef = doc(db, 'Patient', patientId);
  const docSnap = await getDoc(patientRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    document.getElementById('last_name').value = data.Last_Name;
    document.getElementById('first_name').value = data.First_Name;
    document.getElementById('email').value = data.Email;
    document.getElementById('age').value = data.Age;
    document.getElementById('cnp').value = data.CNP;
    document.getElementById('country').value = data.Country;
    document.getElementById('county').value = data.County;
    document.getElementById('city').value = data.City;
    document.getElementById('street').value = data.Street;
    document.getElementById('street_number').value = data.Street_Number;
    document.getElementById('apartment_building').value = data.Apartment_Building;
    document.getElementById('apartment').value = data.Apartment;
    document.getElementById('phone').value = data.Phone;
    document.getElementById('job').value = data.Job;
    document.getElementById('workplace').value = data.Workplace;
    document.getElementById('diagnosis').value = data.Diagnosis;
    document.getElementById('other_observations').value = data.Other_Observations;
    document.getElementById('corridor').value = data.Corridor;
    document.getElementById('room_number').value = data.Room_Number;
    document.getElementById('bed_number').value = data.Bed_Number;

    // Add event listener for form submission
    const patientForm = document.getElementById('patient-form');
    patientForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await savePatientData(patientId);
      closeEditForm();
      // Reload patient data after saving changes
      fetchData();
    });

  } else {
    console.error('No such document!');
  }

  // Add event listener for cancel button
  const cancelButton = document.getElementById('cancel-button');
  cancelButton.addEventListener('click', closeEditForm);
}

// Function to close edit form
function closeEditForm() {
  const editPatientForm = document.getElementById('edit-patient-form');
  editPatientForm.classList.add('hidden');
}

// Function to save edited patient data to Firestore
async function savePatientData(patientId) {
  const patientRef = doc(db, 'Patient', patientId);
  await updateDoc(patientRef, {
    Last_Name: document.getElementById('last_name').value,
    First_Name: document.getElementById('first_name').value,
    Email: document.getElementById('email').value,
    Age: document.getElementById('age').value,
    CNP: document.getElementById('cnp').value,
    Country: document.getElementById('country').value,
    County: document.getElementById('county').value,
    City: document.getElementById('city').value,
    Street: document.getElementById('street').value,
    Street_Number: document.getElementById('street_number').value,
    Apartment_Building: document.getElementById('apartment_building').value,
    Apartment: document.getElementById('apartment').value,
    Phone: document.getElementById('phone').value,
    Job: document.getElementById('job').value,
    Workplace: document.getElementById('workplace').value,
    Diagnosis: document.getElementById('diagnosis').value,
    Other_Observations: document.getElementById('other_observations').value,
    Corridor: document.getElementById('corridor').value,
    Room_Number: document.getElementById('room_number').value,
    Bed_Number: document.getElementById('bed_number').value
  });
}

// Function to handle search button click
function handleSearch() {
  const searchQuery = document.getElementById('search-bar').value.trim();
  fetchData(searchQuery);
}

// Call the function to fetch data on page load
window.addEventListener('DOMContentLoaded', () => fetchData());

// Add event listener to the search button
document.getElementById('search-button').addEventListener('click', handleSearch);

// Add event listener to the search bar to trigger search on Enter key press
document.getElementById('search-bar').addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    handleSearch();
  }
});

// Function to add new patient to Firestore
async function addPatientToFirestore(lastName, firstName, email, age, cnp, country, county, city, street, streetNumber, apartmentBuilding, apartment, phone, job, workplace, diagnosis, otherObservations, corridor, roomNumber, bedNumber) {
  try {
    await addDoc(collection(db, 'Patient'), {
      Last_Name: lastName,
      First_Name: firstName,
      Email: email,
      Age: age,
      CNP: cnp,
      Country: country,
      County: county,
      City: city,
      Street: street,
      Street_Number: streetNumber,
      Apartment_Building: apartmentBuilding,
      Apartment: apartment,
      Phone: phone,
      Job: job,
      Workplace: workplace,
      Diagnosis: diagnosis,
      Other_Observations: otherObservations,
      Corridor: corridor,
      Room_Number: roomNumber,
      Bed_Number: bedNumber
    });
    console.log("Document successfully added!");
    fetchData();
  } catch (error) {
    console.error("Error adding document: ", error);
  }
}

// Function to open add form for new patient
function openAddForm() {
  const addPatientForm = document.getElementById('add-patient-form');
  addPatientForm.classList.remove('hidden');
}

// Function to close add form
function closeAddForm() {
  const addPatientForm = document.getElementById('add-patient-form');
  addPatientForm.classList.add('hidden');
}

// Function to save new patient data
function saveNewPatientData() {
  const lastName = document.getElementById('add-last_name').value;
  const firstName = document.getElementById('add-first_name').value;
  const email = document.getElementById('add-email').value;
  const age = document.getElementById('add-age').value;
  const cnp = document.getElementById('add-cnp').value;
  const country = document.getElementById('add-country').value;
  const county = document.getElementById('add-county').value;
  const city = document.getElementById('add-city').value;
  const street = document.getElementById('add-street').value;
  const streetNumber = document.getElementById('add-street_number').value;
  const apartmentBuilding = document.getElementById('add-apartment_building').value;
  const apartment = document.getElementById('add-apartment').value;
  const phone = document.getElementById('add-phone').value;
  const job = document.getElementById('add-job').value;
  const workplace = document.getElementById('add-workplace').value;
  const diagnosis = document.getElementById('add-diagnosis').value;
  const otherObservations = document.getElementById('add-other_observations').value;
  const corridor = document.getElementById('add-corridor').value;
  const roomNumber = document.getElementById('add-room_number').value;
  const bedNumber = document.getElementById('add-bed_number').value;

  addPatientToFirestore(lastName, firstName, email, age, cnp, country, county, city, street, streetNumber, apartmentBuilding, apartment, phone, job, workplace, diagnosis, otherObservations, corridor, roomNumber, bedNumber);
}

// Function to handle form submission for adding a new patient
const addPatientForm = document.getElementById('add-form');
addPatientForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  saveNewPatientData();
  closeAddForm();
});

// Function to handle cancel button in add form
const addCancelButton = document.getElementById('add-btn-cancel');
addCancelButton.addEventListener('click', () => {
  closeAddForm();
});

// Function to initialize the application
function initApp() {
  // Add event listener for add button to open add form
  const addButton = document.getElementById('add-button');
  addButton.addEventListener('click', openAddForm);
}

// Call initApp function on DOM content loaded
document.addEventListener('DOMContentLoaded', initApp);