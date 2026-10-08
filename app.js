const fallbackSettings = {
  // Dieser Fallback ermöglicht die direkte lokale Nutzung über file:///.
  // Er entspricht der ausgelieferten settings.json, falls der Browser JSON-Dateien lokal sperrt.
  solution: ["E", "FIS", "G", "G", "G", "E", "H", "A"],
  video: "Loesung.mp4",
  audioExtension: "m4a",
  sounds: ["E", "FIS", "G", "A", "H"]
};

let settings = fallbackSettings;
let selected = [];
let currentAudio = null;

const buttons = document.querySelector("#sound-buttons");
const sequenceList = document.querySelector("#sequence-list");
const emptyState = document.querySelector("#empty-state");
const status = document.querySelector("#status");
const reward = document.querySelector("#reward");
const video = document.querySelector("#solution-video");

async function loadSettings() {
  try {
    const response = await fetch("content/settings.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Settings konnten nicht geladen werden.");
    const config = await response.json();
    if (!Array.isArray(config.solution) || !config.solution.length) throw new Error("In settings.json fehlt eine gültige Lösung.");
    settings = { ...fallbackSettings, ...config };
    if (!Array.isArray(settings.sounds) || !settings.sounds.length) throw new Error("In settings.json fehlen die Sounds.");
  } catch (error) {
    console.warn(error);
    setStatus("Die lokale Klangkonfiguration wird verwendet.", "");
  }
  renderSounds();
  video.src = `content/video/${settings.video}`;
}

function renderSounds() {
  buttons.innerHTML = "";
  settings.sounds.forEach((sound, index) => {
    const catNumber = index + 1;
    const card = document.createElement("div");
    card.className = "sound-card";
    const playButton = document.createElement("button");
    playButton.type = "button";
    playButton.className = "play-button";
    playButton.setAttribute("aria-label", `Katzengeräusch ${catNumber} abspielen`);
    playButton.innerHTML = '<span aria-hidden="true">▶</span><span>Abspielen</span>';
    playButton.addEventListener("click", () => playSound(sound, playButton));
    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.className = "sound-button";
    selectButton.setAttribute("aria-label", `Katze ${catNumber} zur Nachricht hinzufügen`);
    selectButton.append(createCatIcon(catNumber), document.createTextNode("Hinzufügen"));
    selectButton.addEventListener("click", () => chooseSound(sound, catNumber, playButton));
    card.append(playButton, selectButton);
    buttons.append(card);
  });
}

function createCatIcon(catNumber) {
  const icon = document.createElement("span");
  icon.className = `cat-icon cat-${catNumber}`;
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = `<svg viewBox="0 0 24 24" focusable="false">
    <path d="M5 19V8l4-4 3 4 3-4 4 4v11" />
    <path d="M8 13h2m4 0h2M12 12v6m-3 1h6" />
  </svg>`;
  return icon;
}

function playSound(sound, button) {
  if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; document.querySelectorAll(".is-playing").forEach((item) => item.classList.remove("is-playing")); }
  currentAudio = new Audio(`content/audio/${sound}.${settings.audioExtension}`);
  currentAudio.addEventListener("ended", () => button.classList.remove("is-playing"));
  currentAudio.play().catch(() => setStatus("Dieser Ruf konnte nicht abgespielt werden.", "error"));
  button.classList.add("is-playing");
}

function chooseSound(sound, catNumber, playButton) {
  playSound(sound, playButton);
  selected.push(sound);
  reward.hidden = true;
  renderSequence();
  setStatus("Eine Katze wurde deiner Nachricht hinzugefügt.", "");
}

function renderSequence() {
  sequenceList.innerHTML = "";
  emptyState.hidden = selected.length > 0;
  selected.forEach((sound, index) => {
    const catNumber = settings.sounds.indexOf(sound) + 1;
    const item = document.createElement("li");
    item.append(createCatIcon(catNumber));
    const remove = document.createElement("button");
    remove.className = "remove-choice";
    remove.type = "button";
    remove.title = "Diesen Ruf entfernen";
    remove.setAttribute("aria-label", "Katze aus der Nachricht entfernen");
    remove.textContent = "×";
    remove.addEventListener("click", () => { selected.splice(index, 1); renderSequence(); });
    item.append(remove);
    sequenceList.append(item);
  });
}

function setStatus(message, type) { status.textContent = message; status.className = `status ${type}`; }

document.querySelector("#clear-button").addEventListener("click", () => { selected = []; reward.hidden = true; renderSequence(); setStatus("Die Nachricht wurde verworfen.", ""); });
async function playSequence() {
  if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
  for (const [index, sound] of selected.entries()) {
    await new Promise((resolve) => {
      const audio = new Audio(`content/audio/${sound}.${settings.audioExtension}`);
      currentAudio = audio;
      const isFirstOrLast = index === 0 || index === selected.length - 1;
      audio.playbackRate = isFirstOrLast || index === 2 ? 1 : index <= 2 ? 1.5 : 1.8;
      audio.addEventListener("ended", resolve, { once: true });
      audio.addEventListener("error", resolve, { once: true });
      audio.play().catch(resolve);
    });
  }
}

document.querySelector("#activate-button").addEventListener("click", async () => {
  if (!selected.length) return setStatus("Füge zuerst mindestens einen Katzenruf hinzu.", "error");
  const correct = selected.length === settings.solution.length && selected.every((sound, i) => sound === String(settings.solution[i]));
  const sendButton = document.querySelector("#activate-button");
  sendButton.disabled = true;
  reward.hidden = true;
  setStatus("Die Nachricht wird übermittelt …", "");
  await playSequence();
  if (correct) {
    reward.hidden = false;
    setStatus("Die Nachricht wurde übermittelt!", "success");
    reward.scrollIntoView({ behavior: "smooth", block: "center" });
    video.currentTime = 0;
    video.play().catch(() => setStatus("Die Nachricht ist bereit. Starte das Video mit dem Abspielsymbol.", "success"));
  } else {
    setStatus("Übermittlung fehlgeschlagen.", "error");
  }
  sendButton.disabled = false;
});

loadSettings();
