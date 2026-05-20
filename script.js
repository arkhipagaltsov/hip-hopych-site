const tracks = [
  {
    src: "Olya.mp3",
    name: "Оля",
    artist: "Хип-Хопыч",
    mood: "лирика",
    year: "2026"
  },
  {
    src: "Pro-solnce.mp3",
    name: "Про солнце. Виним Витю Ак",
    artist: "Хип-Хопыч",
    mood: "рэп",
    year: "2026"
  }
];

const page = document.body.dataset.page;
const audio = document.getElementById("audio");
const title = document.getElementById("track-title");
const meta = document.getElementById("track-meta");
const progress = document.getElementById("progress");
const progressContainer = document.getElementById("progress-container");
const currentTime = document.getElementById("current-time");
const duration = document.getElementById("duration");
const playToggle = document.getElementById("play-toggle");
const prevButton = document.getElementById("prev-btn");
const nextButton = document.getElementById("next-btn");
const repeatButton = document.getElementById("repeat-btn");
const volume = document.getElementById("volume");
const homeTrackList = document.getElementById("home-track-list");
const catalogTrackList = document.getElementById("catalog-track-list");
const searchInput = document.getElementById("track-search");

let currentTrack = Number(localStorage.getItem("hipHopychTrack")) || 0;
let repeatEnabled = false;

function getTrack(index) {
  return tracks[index] || tracks[0];
}

function loadTrack(index, shouldPlay = false) {
  currentTrack = (index + tracks.length) % tracks.length;
  const track = getTrack(currentTrack);

  audio.src = track.src;
  title.textContent = track.name;
  meta.textContent = `${track.artist} · ${track.mood} · ${track.year}`;
  localStorage.setItem("hipHopychTrack", String(currentTrack));
  updateActiveTrack();

  if (shouldPlay) {
    audio.play();
  }
}

function togglePlay() {
  if (audio.paused) {
    audio.play();
    return;
  }

  audio.pause();
}

function nextTrack(shouldPlay = !audio.paused) {
  loadTrack(currentTrack + 1, shouldPlay);
}

function prevTrack() {
  if (audio.currentTime > 4) {
    audio.currentTime = 0;
    return;
  }

  loadTrack(currentTrack - 1, !audio.paused);
}

function setProgress(event) {
  if (!audio.duration) return;

  const bounds = progressContainer.getBoundingClientRect();
  const clickX = event.clientX - bounds.left;
  audio.currentTime = (clickX / bounds.width) * audio.duration;
}

function formatTime(time) {
  if (!Number.isFinite(time)) return "0:00";

  const minutes = Math.floor(time / 60);
  const seconds = String(Math.floor(time % 60)).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function updateProgress() {
  const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  progress.style.width = `${percent}%`;
  progressContainer.setAttribute("aria-valuenow", String(Math.round(percent)));
  currentTime.textContent = formatTime(audio.currentTime);
  duration.textContent = formatTime(audio.duration);
}

function updatePlayButton() {
  const isPlaying = !audio.paused;
  playToggle.textContent = isPlaying ? "Ⅱ" : "▶";
  playToggle.setAttribute("aria-label", isPlaying ? "Пауза" : "Воспроизвести");
  document.body.classList.toggle("is-playing", isPlaying);
  updateActiveTrack();
}

function toggleRepeat() {
  repeatEnabled = !repeatEnabled;
  audio.loop = repeatEnabled;
  repeatButton.textContent = repeatEnabled ? "Повтор вкл." : "Повтор выкл.";
  repeatButton.setAttribute("aria-pressed", String(repeatEnabled));
}

function createTrackCard(track, index) {
  const card = document.createElement("article");
  card.className = "track-card";
  card.dataset.trackIndex = String(index);

  const number = document.createElement("span");
  number.className = "track-number";
  number.textContent = String(index + 1).padStart(2, "0");

  const info = document.createElement("div");
  info.className = "track-info";

  const name = document.createElement("h3");
  name.textContent = track.name;

  const details = document.createElement("p");
  details.textContent = `${track.artist} · ${track.mood} · ${track.year}`;

  info.append(name, details);

  const actions = document.createElement("div");
  actions.className = "track-actions";

  const playButton = document.createElement("button");
  playButton.className = "track-action";
  playButton.type = "button";
  playButton.textContent = "▶";
  playButton.setAttribute("aria-label", `Включить ${track.name}`);
  playButton.addEventListener("click", () => loadTrack(index, true));

  const download = document.createElement("a");
  download.className = "track-action";
  download.href = track.src;
  download.download = "";
  download.textContent = "↓";
  download.setAttribute("aria-label", `Скачать ${track.name}`);

  actions.append(playButton, download);
  card.append(number, info, actions);

  card.addEventListener("dblclick", () => loadTrack(index, true));
  return card;
}

function renderTrackList(container, list = tracks) {
  if (!container) return;

  container.innerHTML = "";

  if (!list.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "По этому запросу треков не найдено.";
    container.append(empty);
    return;
  }

  list.forEach((track) => {
    const originalIndex = tracks.indexOf(track);
    container.append(createTrackCard(track, originalIndex));
  });

  updateActiveTrack();
}

function updateActiveTrack() {
  document.querySelectorAll(".track-card").forEach((card) => {
    const isActive = Number(card.dataset.trackIndex) === currentTrack;
    card.classList.toggle("active", isActive);

    const button = card.querySelector("button");
    if (button) {
      button.textContent = isActive && !audio.paused ? "Ⅱ" : "▶";
    }
  });
}

function filterTracks() {
  const query = searchInput.value.trim().toLowerCase();
  const filteredTracks = tracks.filter((track) => {
    return [track.name, track.artist, track.mood, track.year].some((value) => {
      return value.toLowerCase().includes(query);
    });
  });

  renderTrackList(catalogTrackList, filteredTracks);
}

function bindEvents() {
  playToggle.addEventListener("click", togglePlay);
  prevButton.addEventListener("click", prevTrack);
  nextButton.addEventListener("click", () => nextTrack());
  repeatButton.addEventListener("click", toggleRepeat);
  progressContainer.addEventListener("click", setProgress);

  progressContainer.addEventListener("keydown", (event) => {
    if (!audio.duration) return;

    if (event.key === "ArrowLeft") {
      audio.currentTime = Math.max(0, audio.currentTime - 5);
    }

    if (event.key === "ArrowRight") {
      audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
    }
  });

  volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
  });

  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("loadedmetadata", updateProgress);
  audio.addEventListener("play", updatePlayButton);
  audio.addEventListener("pause", updatePlayButton);
  audio.addEventListener("ended", () => {
    if (!repeatEnabled) nextTrack(true);
  });

  if (searchInput) {
    searchInput.addEventListener("input", filterTracks);
  }

  document.addEventListener("keydown", (event) => {
    const tag = document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    if (event.code === "Space") {
      event.preventDefault();
      togglePlay();
    }
  });
}

function init() {
  if (!audio) return;

  audio.volume = Number(volume.value);
  renderTrackList(homeTrackList);
  renderTrackList(catalogTrackList);
  loadTrack(currentTrack, false);
  bindEvents();

  if (page === "tracks") {
    document.title = "Каталог треков | Хип-Хопыч";
  }
}

init();
