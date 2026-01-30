// 1. Configuració de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDILfUlkw0h9U4FhhLDgkWEB43FimGPOpw",
  authDomain: "old-netlify.firebaseapp.com",
  projectId: "old-netlify",
  storageBucket: "old-netlify.firebasestorage.app",
  messagingSenderId: "314394617998",
  appId: "1:314394617998:web:c6675494f552f9265f41df",
  measurementId: "G-0MWLJ4VGLE"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const rankingRef = db.collection("ranking");

// Variables de control
let frases = [];
let fraseActual = null;
let ratxa = 0;

// Elements del DOM
const textFrase = document.getElementById("text-frase");
const autorInfo = document.getElementById("autor-info");
const ratxaDisplay = document.getElementById("ratxa-valor");
const feedback = document.getElementById("missatge-feedback");
const llistaRanking = document.getElementById("llista-ranking");

// 2. Gestionar el desplegable del Rànquing
window.toggleRanking = function() {
  document.getElementById("contingut-ranking").classList.toggle("dropdown-show");
};

// 3. Carregar dades i inicialitzar
async function inicialitzar() {
  try {
    const res = await fetch('frases.json');
    frases = await res.json();
    novaFrase();
    escoltarRanking();
  } catch (e) {
    textFrase.innerText = "Error: Recorda usar Live Server per carregar el JSON local.";
  }
}

function novaFrase() {
  feedback.innerText = "";
  autorInfo.innerText = "";
  const randomIdx = Math.floor(Math.random() * frases.length);
  fraseActual = frases[randomIdx];
  textFrase.innerText = fraseActual.text;
}

// 4. Lògica de joc
window.comprovar = async (tipus) => {
  autorInfo.innerText = `- ${fraseActual.author}`;
  
  if (tipus === fraseActual.type) {
    ratxa++;
    feedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> Correcte!';
    feedback.style.color = "#10b981";
    ratxaDisplay.innerText = ratxa;
    setTimeout(novaFrase, 1500);
  } else {
    feedback.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Has fallat!';
    feedback.style.color = "#ef4444";
    await finalitzarPartida();
  }
};

async function finalitzarPartida() {
  const puntsObtinguts = ratxa;
  ratxa = 0;
  ratxaDisplay.innerText = 0;

  if (puntsObtinguts > 0) {
    setTimeout(async () => {
      const nom = prompt(`Ratxa finalitzada: ${puntsObtinguts} punts. Nom per al rànquing:`);
      if (nom) {
        await rankingRef.add({
          usuari: nom,
          punts: puntsObtinguts,
          creado: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      novaFrase();
    }, 1000);
  } else {
    setTimeout(novaFrase, 2000);
  }
}

// 5. Escolta del ranking
function escoltarRanking() {
  rankingRef
    .orderBy("punts", "desc")
    .limit(5)
    .onSnapshot((snapshot) => {
      llistaRanking.innerHTML = "";
      snapshot.forEach(doc => {
        const d = doc.data();
        const li = document.createElement("li");
        li.innerHTML = `<span>${d.usuari}</span> <strong>${d.punts}</strong>`;
        llistaRanking.appendChild(li);
      });
    });
}

inicialitzar();