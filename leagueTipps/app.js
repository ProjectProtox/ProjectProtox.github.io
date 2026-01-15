// =======================
// CONFIG
// =======================
const sentences = [
  "Behalte die Karte im Auge",
  "Warding gewinnt Spiele",
  "Kommunikation ist der Schlüssel",
  "Fokus auf die Objectives",
  "Respektiere den Gank",
  "Positionierung entscheidet Fights",
  "Kauf dir ein Kontroll-Auge",
  "Bleib ruhig und konzentriert"
];

// =======================
// STATE
// =======================
const state = {
  text: "",
  bg: { r: 255, g: 255, b: 255 },
  contrast: "black"
};

// =======================
// DOM
// =======================
const dom = {
  body: document.getElementById("bg-main"),
  text: document.getElementById("text-display"),
  btn: document.getElementById("btn-next")
};

// =======================
// LOGIC
// =======================
function roll() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  state.bg = { r, g, b };

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  state.contrast = luminance > 0.5 ? "black" : "white";

  state.text = sentences[Math.floor(Math.random() * sentences.length)];

  render();
}

// =======================
// RENDER
// =======================
function render() {
  const { r, g, b } = state.bg;
  dom.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  dom.text.innerText = state.text;
  dom.text.style.color = state.contrast;
  dom.btn.style.color = state.contrast;
  dom.btn.style.borderColor = state.contrast;
}

// =======================
// INIT
// =======================
dom.btn.addEventListener("click", roll);
roll();
