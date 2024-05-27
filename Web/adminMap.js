import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", async function() {
  const canvas = document.getElementById('hospitalMap');
  const ctx = canvas.getContext('2d');
  const addRoomButton = document.getElementById('add-room-button');
  const deleteRoomButton = document.getElementById('delete-room-button');
  const editRoomButton = document.getElementById('edit-room-button');
  const drawRouteButton = document.getElementById('draw-route-button');
  const addRoomForm = document.getElementById('add-room-form');
  const deleteRoomForm = document.getElementById('delete-room-form');
  const editRoomForm = document.getElementById('edit-room-form');
  const roomLabelInput = document.getElementById('room-label');
  const deleteRoomSelect = document.getElementById('delete-room-select');
  const editRoomSelect = document.getElementById('edit-room-select');
  const newRoomLabelInput = document.getElementById('new-room-label');
  const cancelAddRoomButton = document.getElementById('cancel-add-room');
  const cancelDeleteRoomButton = document.getElementById('cancel-delete-room');
  const cancelEditRoomButton = document.getElementById('cancel-edit-room');

  let rooms = [];
  let routes = [];

  let isDragging = false;
  let draggedRoom = null;
  let offsetX, offsetY;
  let isAddingRoom = false;
  let isDrawingRoute = false;
  let routeStart = null;

  async function fetchRooms() {
    const querySnapshot = await getDocs(collection(db, "Map_coordinates"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const room = {
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
        label: data.label,
        id: doc.id
      };
      rooms.push(room);
    });
    drawMap();
    populateDeleteRoomSelect();
    populateEditRoomSelect();
  }

  async function fetchRoutes() {
    const querySnapshot = await getDocs(collection(db, "Map_routes"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const route = {
        start: rooms.find(room => room.id === data.start),
        end: rooms.find(room => room.id === data.end)
      };
      routes.push(route);
    });
    drawMap();
  }

  function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    rooms.forEach(room => {
      ctx.fillStyle = 'lightblue';
      ctx.fillRect(room.x, room.y, room.width, room.height);
      ctx.strokeRect(room.x, room.y, room.width, room.height);

      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.fillText(room.label, room.x + 10, room.y + 50);
    });

    routes.forEach(route => {
      const start = calculateIntersection(route.start, route.end);
      const end = calculateIntersection(route.end, route.start);

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    });
  }

  function calculateIntersection(room1, room2) {
    const room1CenterX = room1.x + room1.width / 2;
    const room1CenterY = room1.y + room1.height / 2;
    const room2CenterX = room2.x + room2.width / 2;
    const room2CenterY = room2.y + room2.height / 2;

    const dx = room2CenterX - room1CenterX;
    const dy = room2CenterY - room1CenterY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    let intersectX, intersectY;

    if (absDx > absDy) {
      intersectX = dx > 0 ? room1.x + room1.width : room1.x;
      intersectY = room1CenterY + dy * ((intersectX - room1CenterX) / dx);
    } else {
      intersectY = dy > 0 ? room1.y + room1.height : room1.y;
      intersectX = room1CenterX + dx * ((intersectY - room1CenterY) / dy);
    }

    return { x: intersectX, y: intersectY };
  }

  function isInsideRoom(x, y, room) {
    return x > room.x && x < room.x + room.width && y > room.y && y < room.y + room.height;
  }

  function populateDeleteRoomSelect() {
    deleteRoomSelect.innerHTML = '';
    rooms.forEach(room => {
      const option = document.createElement('option');
      option.value = room.id;
      option.textContent = room.label;
      deleteRoomSelect.appendChild(option);
    });
  }

  function populateEditRoomSelect() {
    editRoomSelect.innerHTML = '';
    rooms.forEach(room => {
      const option = document.createElement('option');
      option.value = room.id;
      option.textContent = room.label;
      editRoomSelect.appendChild(option);
    });
  }

  async function saveRoute(route) {
    const newRoute = {
      start: route.start.id,
      end: route.end.id
    };
    await addDoc(collection(db, "Map_routes"), newRoute);
  }

  canvas.addEventListener('mousedown', async function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDrawingRoute) {
      rooms.forEach(async room => {
        if (isInsideRoom(mouseX, mouseY, room)) {
          if (!routeStart) {
            routeStart = room;
          } else {
            const newRoute = { start: routeStart, end: room };
            routes.push(newRoute);
            await saveRoute(newRoute);
            routeStart = null;
            drawMap();
          }
        }
      });
    } else {
      rooms.forEach(room => {
        if (isInsideRoom(mouseX, mouseY, room)) {
          isDragging = true;
          draggedRoom = room;
          offsetX = mouseX - room.x;
          offsetY = mouseY - room.y;
        }
      });
    }
  });

  canvas.addEventListener('mousemove', async function(e) {
    if (isDragging) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      draggedRoom.x = mouseX - offsetX;
      draggedRoom.y = mouseY - offsetY;

      await updateRoomPosition(draggedRoom);
      drawMap();
    }
  });

  async function updateRoomPosition(room) {
    const roomRef = doc(db, "Map_coordinates", room.id);
    await updateDoc(roomRef, { x: room.x, y: room.y });
  }

  canvas.addEventListener('mouseup', function() {
    isDragging = false;
    draggedRoom = null;
  });

  addRoomButton.addEventListener('click', function() {
    addRoomForm.style.display = 'flex';
    addRoomForm.style.flexDirection = 'column';
    deleteRoomForm.style.display = 'none';
    editRoomForm.style.display = 'none';
  });

  addRoomForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const roomLabel = roomLabelInput.value.trim();
    if (roomLabel !== "") {
      const newRoom = {
        x: 0,
        y: canvas.height - 100, // Place the new room in the bottom-left corner
        width: 100,
        height: 100,
        label: roomLabel
      };
      const docRef = await addDoc(collection(db, "Map_coordinates"), newRoom);
      newRoom.id = docRef.id;
      rooms.push(newRoom);
      drawMap();
      populateDeleteRoomSelect();
      populateEditRoomSelect();
      addRoomForm.style.display = 'none';
      roomLabelInput.value = '';
    }
  });

  cancelAddRoomButton.addEventListener('click', function() {
    addRoomForm.style.display = 'none';
    roomLabelInput.value = '';
  });

  deleteRoomButton.addEventListener('click', function() {
    deleteRoomForm.style.display = 'flex';
    deleteRoomForm.style.flexDirection = 'column';
    addRoomForm.style.display = 'none';
    editRoomForm.style.display = 'none';
    populateDeleteRoomSelect();
  });

  deleteRoomForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const roomId = deleteRoomSelect.value;
    if (roomId !== "") {
      await deleteDoc(doc(db, "Map_coordinates", roomId));
      rooms = rooms.filter(room => room.id !== roomId);

      // Remove routes associated with the deleted room
      const querySnapshot = await getDocs(collection(db, "Map_routes"));
      querySnapshot.forEach(async (routeDoc) => {
        const data = routeDoc.data();
        if (data.start === roomId || data.end === roomId) {
          await deleteDoc(routeDoc.ref);
        }
      });

      routes = routes.filter(route => route.start.id !== roomId && route.end.id !== roomId);
      drawMap();
      populateDeleteRoomSelect();
      populateEditRoomSelect();
      deleteRoomForm.style.display = 'none';
    }
  });

  cancelDeleteRoomButton.addEventListener('click', function() {
    deleteRoomForm.style.display = 'none';
  });

  editRoomButton.addEventListener('click', function() {
    editRoomForm.style.display = 'flex';
    editRoomForm.style.flexDirection = 'column';
    addRoomForm.style.display = 'none';
    deleteRoomForm.style.display = 'none';
    populateEditRoomSelect();
  });

  editRoomForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const roomId = editRoomSelect.value;
    const newRoomLabel = newRoomLabelInput.value.trim();
    if (roomId !== "" && newRoomLabel !== "") {
      const roomRef = doc(db, "Map_coordinates", roomId);
      await updateDoc(roomRef, { label: newRoomLabel });
      rooms.forEach(room => {
        if (room.id === roomId) {
          room.label = newRoomLabel;
        }
      });
      drawMap();
      populateDeleteRoomSelect();
      populateEditRoomSelect();
      editRoomForm.style.display = 'none';
      newRoomLabelInput.value = '';
    }
  });

  cancelEditRoomButton.addEventListener('click', function() {
    editRoomForm.style.display = 'none';
    newRoomLabelInput.value = '';
  });

  drawRouteButton.addEventListener('click', function() {
    isDrawingRoute = !isDrawingRoute;
    drawRouteButton.textContent = isDrawingRoute ? 'Stop Drawing Route' : 'Draw Route';
  });

  await fetchRooms();
  await fetchRoutes();
});
