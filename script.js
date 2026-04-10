let audio = document.getElementById("audio");
let title = document.getElementById("track-title");
let progress = document.getElementById("progress");

let tracks = [
  { src: "Olya.mp3", name: "Оля" },
  { src: "Pro-solnce.mp3", name: "Про солнце. Виним Витю Ак" }
];

let currentTrack = 0;

// загрузка трека
function loadTrack(index) {
  currentTrack = index;
  audio.src = tracks[index].src;
  title.innerText = tracks[index].name;
  audio.play();
}

// кнопки
function play() {
  audio.play();
}

function pause() {
  audio.pause();
}

function nextTrack() {
  currentTrack++;
  if (currentTrack >= tracks.length) currentTrack = 0;
  loadTrack(currentTrack);
}

function prevTrack() {
  currentTrack--;
  if (currentTrack < 0) currentTrack = tracks.length - 1;
  loadTrack(currentTrack);
}

// обновление прогресса
audio.addEventListener("timeupdate", () => {
    if (audio.duration) {
      let percent = (audio.currentTime / audio.duration) * 100;
      progress.style.width = percent + "%";
    }
  
    document.getElementById("current-time").innerText = formatTime(audio.currentTime);
    document.getElementById("duration").innerText = formatTime(audio.duration);
  });

// перемотка
function setProgress(e) {
  let width = e.currentTarget.clientWidth;
  let clickX = e.offsetX;
  let duration = audio.duration;

  audio.currentTime = (clickX / width) * duration;
}

// формат времени
function formatTime(time) {
  if (isNaN(time)) return "0:00";
  let minutes = Math.floor(time / 60);
  let seconds = Math.floor(time % 60);
  if (seconds < 10) seconds = "0" + seconds;
  return minutes + ":" + seconds;
}

// автозагрузка
window.onload = () => {
  loadTrack(0);
  audio.pause();
};