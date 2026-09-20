const fallbackSettings = {
  solution: ["1", "2", "3", "4", "5", "6", "7"],
  video: "Loesung.mp4",
  audioExtension: "m4a",
  sequenceOverlapMs: 500,
  sounds: ["1", "2", "3", "4", "5", "6", "7"]
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
  } catch (error) {
    console.warn(error);
    setStatus("Die Standardbeschwörung wird verwendet.", "");
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
    selectButton.textContent = `Katze ${catNumber} hinzufügen`;
    selectButton.addEventListener("click", () => chooseSound(sound, catNumber, playButton));
    card.append(playButton, selectButton);
    buttons.append(card);
  });
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
  setStatus(`Katze ${catNumber} wurde deiner Nachricht hinzugefügt.`, "");
}

function renderSequence() {
  sequenceList.innerHTML = "";
  emptyState.hidden = selected.length > 0;
  selected.forEach((sound, index) => {
    const catNumber = settings.sounds.indexOf(sound) + 1;
    const item = document.createElement("li");
    item.append(`Katze ${catNumber} `);
    const remove = document.createElement("button");
    remove.className = "remove-choice";
    remove.type = "button";
    remove.title = "Diesen Ruf entfernen";
    remove.setAttribute("aria-label", `Katze ${catNumber} entfernen`);
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
  for (const sound of selected) {
    await new Promise((resolve) => {
      const audio = new Audio(`content/audio/${sound}.${settings.audioExtension}`);
      currentAudio = audio;
      audio.addEventListener("ended", resolve, { once: true });
      audio.addEventListener("error", resolve, { once: true });
      audio.addEventListener("loadedmetadata", () => {
        const nextSoundAt = Math.max(0, (audio.duration * 1000) - settings.sequenceOverlapMs);
        window.setTimeout(resolve, nextSoundAt);
      }, { once: true });
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
