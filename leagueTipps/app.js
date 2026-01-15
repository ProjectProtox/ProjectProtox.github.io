// PURPOSE:
// Application logic for state management, random color/text generation, and DOM synchronization.
// PUBLIC API CONTRACT:
// - roll(): Triggers state change and re-render.
// - render(): Synchronizes visual state with the HTML document.
const sentences = [
  "Plane deine Waves 2–3 Züge im Voraus, nicht nur den aktuellen Trade",
  "Jede Lane-Action muss einen Jungle-Zeitpunkt respektieren",
  "Spiele um Win Conditions, nicht um Gleichstand",
  "Ein schlechter Reset ist oft schlimmer als ein verlorener Trade",
  "Nutze Slowpushes gezielt, um Map Pressure zu erzeugen",
  "Vision ohne Druck ist wertlos – Druck ohne Vision ist Risiko",
  "Tracke den gegnerischen Jungler über Camps, nicht über Hoffnung",
  "Force nichts vor Power Spikes, abuse alles danach",
  "Midgame-Tempo entscheidet mehr Spiele als Laning",
  "Roams müssen Waves rechtfertigen, sonst sind sie Fehler",
  "Objective-Timer sind wichtiger als KDA",
  "Spiele Teamfights von der ersten Fähigkeit an, nicht vom Engage",
  "Peel gewinnt mehr High-Elo-Fights als Hard-Engage",
  "Jede Information, die du siehst, muss eine Entscheidung erzeugen",
  "Side-Lane-Druck ist ein Werkzeug, kein Selbstzweck",
  "Wenn nichts passiert, hast du etwas falsch vorbereitet",
  "Lerne zu verlieren, ohne das Spieltempo zu verlieren",
  "Mechanics bringen dich in Master, Entscheidungen halten dich dort",
  "Spiele nicht den Champion, spiele den Game State",
  "Konsequenz schlägt Kreativität auf hohem Niveau"
];

const state = {
text: "",
bg: { r: 255, g: 255, b: 255 },
contrast: "black"
};

const dom = {
body: document.getElementById("bg-main"),
text: document.getElementById("text-display"),
btn: document.getElementById("btn-next")
};

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

function render() {
const { r, g, b } = state.bg;
const colorString = rgb(${r}, ${g}, ${b});

dom.body.style.backgroundColor = colorString;
dom.text.innerText = state.text;
dom.text.style.color = state.contrast;

dom.btn.style.color = state.contrast;
dom.btn.style.borderColor = state.contrast;
}

dom.btn.addEventListener("click", roll);

document.addEventListener("DOMContentLoaded", roll);
// END OF FILE
