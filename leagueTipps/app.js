// PURPOSE:
// Application logic for state management, random color/text generation, and DOM synchronization.
// PUBLIC API CONTRACT:
// - roll(): Triggers state change and re-render.
// - render(): Synchronizes visual state with the HTML document.
const sentences = [
  "Plane deine Züge basierend auf gegnerischem Mana, nicht auf Wunschdenken",
  "Jede gespielte Karte muss Tempo, Kartenvorteil oder Position erzeugen",
  "Halte Interaktion für die entscheidenden Spells, nicht für Bequemlichkeit",
  "Lies das gegnerische Deck über Lines, nicht über einzelne Karten",
  "Mulligans entscheiden mehr Matches als Topdecks",
  "Spiele um Wahrscheinlichkeiten, nicht um Best-Case-Szenarien",
  "Sequencing ist wichtiger als Kartenauswahl",
  "Verwandle Life in eine Ressource, nicht in eine Angst",
  "Zwinge den Gegner, zuerst zu reagieren",
  "Bluffs sind Werkzeuge, keine Gewohnheit",
  "Sideboarding ist ein strategischer Reset, kein Austausch einzelner Karten",
  "Behalte Win Conditions im Blick, auch wenn du hinten liegst",
  "Mana-Effizienz schlägt rohe Kartenstärke",
  "Respektiere offene Mana-Züge mehr als bekannte Handkarten",
  "Erkenne, wann du der Beatdown bist",
  "Ein verpasster Landdrop ist oft das eigentliche Misplay",
  "Card Advantage ohne Zeit ist bedeutungslos",
  "Passe deine Lines an das Matchup an, nicht an dein Ego",
  "Züge ohne Plan sind verlorene Prozentpunkte",
  "Konstanz gewinnt Turniere, nicht Highlight-Plays"
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
