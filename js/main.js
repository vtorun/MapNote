import { personIcon } from "./constant.js";
import { getIcon, getStatus } from "./helper.js";
import { ui } from "./ui.js";

//Global değişkenler
let clickedCoords;
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let layer;
var map;

window.navigator.geolocation.getCurrentPosition(
  (e) => {
    loadMap([e.coords.latitude, e.coords.longitude], "mevcut konum");
  },
  (e) => {
    loadMap([52.377956, 4.89707], "varsayılan");
  }
);

function loadMap(currentPosition, mesage) {
  map = L.map("map", { zoomControl: false }).setView(currentPosition, 11);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  //işaretlerin bir listesini oluştur
  layer = L.layerGroup().addTo(map);

  L.control.zoom({ position: "bottomright" }).addTo(map);

  L.marker(currentPosition, { icon: personIcon }).addTo(map).bindPopup(mesage);

  map.on("click", onMapClick);
  renderNotes();
  renderMakers();
}

function onMapClick(e) {
  clickedCoords = [e.latlng.lat, e.latlng.lng];
  ui.aside.classList.add("add");
}

//yeni not ekle ekranında iptal butonuna tıklanınca
ui.cancelButon.addEventListener("click", () => {
  ui.aside.classList.remove("add");
});

ui.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;

  const newNote = {
    id: new Date().getTime(),
    title,
    date,
    status,
    coords: clickedCoords,
  };
  notes.unshift(newNote);
  localStorage.setItem("notes", JSON.stringify(notes));
  ui.aside.classList.remove("add");
  e.target.reset();
  renderNotes();
  renderMakers();
});

function renderNotes() {
  const noteCards = notes
    .map((note) => {
      const date = new Date(note.date).toLocaleString("tr", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      return `
        <li>
                 <div>
                   <p>${note.title}</p>
                   <p>${date}</p>
                   <p>${getStatus(note.status)}</p>
                 </div>
                 <div class="icons">
                   <i data-id="${
                     note.id
                   }" class="bi bi-airplane-fill" id="fly"></i>
            <i data-id="${note.id}" class="bi bi-trash-fill" id="delete"></i>
                 </div>
               </li>`;
    })
    .join("");
  ui.ul.innerHTML = noteCards;
  debugger;
  document.querySelectorAll("li #delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;

      deleteNote(id);
    });
  });

  document.querySelectorAll("li #fly").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      flyToLocation(id);
    });
  });
}

function deleteNote(id) {
  const res = confirm("Not Silme İşlemini Onaylıyor musunuz?");
  if (res) {
    notes = notes.filter((note) => note.id !== parseInt(id));
  }
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes();
  renderMakers();
}

function renderMakers() {
  layer.clearLayers();
  notes.map((note) => {
    const icon = getIcon(note.status);
    L.marker(note.coords, { icon }).addTo(layer).bindPopup(note.title);
  });
}

function flyToLocation(id) {
  const note = notes.find((note) => note.id === parseInt(id));
  console.log(note);
  map.flyTo(note.coords, 11);
}

ui.arrow.addEventListener("click", () => {
  ui.aside.classList.toggle("hide");
});
