const audio = document.querySelector(".audio");
const playBtn = document.querySelector(".play");
const playIcon = playBtn.querySelector("img");
const prevBtn = document.querySelector(".previous");
const nextBtn = document.querySelector(".next");
const mark = document.querySelector(".progress-mark");
const fileInput = document.getElementById("mp3Input");
const title = document.querySelector(".title");
const cover = document.querySelector(".cover");
const playBar = document.querySelector(".playBar");
const progress = document.querySelector(".progress");
const background = document.querySelector(".background");

const playImg = "https://i.ibb.co/bTTsKBc/play-1.png";
const pauseImg = "https://i.ibb.co/Yz8j2WM/pause.png";

let playlist = [];
let currentIndex = 0;

async function updateCoverFromSongName(songName) { // Buscar capa do álbum via API da iTunes
  try {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(songName)}&entity=song&limit=1`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const artwork = data.results[0].artworkUrl100.replace("100x100", "300x300");
      cover.src = artwork;

      background.style.backgroundImage = `url(${artwork})`;
    } else {
      const fallback = "https://i.ibb.co/s9SDYs3M/image.png";
      cover.src = fallback;
      background.style.backgroundImage = `url(${fallback})`;
    }
  } catch (err) {
    console.error("Erro ao buscar capa do álbum:", err);
    const fallback = "https://i.ibb.co/s9SDYs3M/image.png";
    cover.src = fallback;
    background.style.backgroundImage = `url(${fallback})`;
  }
}

fileInput.addEventListener("change", (e) => { // Selecionar arquivos (mp3)
  const files = Array.from(e.target.files);
  playlist = files.map((file) => ({
    url: URL.createObjectURL(file),
    name: file.name,
  }));

  if (playlist.length > 0) {
    currentIndex = 0;
    loadTrack(currentIndex);
  }
});

function loadTrack(index) { // Carregar música
  const track = playlist[index];
  if (!track) return;

  let nameWithoutExt = track.name.replace(/\.[^/.]+$/, "");

  audio.src = track.url;
  title.textContent =
    nameWithoutExt.length > 30 ? nameWithoutExt.slice(0, 30) + "..." : nameWithoutExt;
  audio.load();
  progress.style.width = "0%";
  playIcon.src = playImg;

  updateCoverFromSongName(nameWithoutExt);
}

playBtn.addEventListener("click", () => {  // Play/Pause
  if (!playlist.length || !audio.src) return;

  if (audio.paused) {
    audio.play();
    playIcon.src = pauseImg;
  } else {
    audio.pause();
    playIcon.src = playImg;
  }
});

audio.addEventListener("timeupdate", () => { // Atualizar barra de progresso
  if (audio.duration) {
    const percent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${percent}%`;
    mark.style.left = `${percent}%`;
  }
});

audio.addEventListener("ended", () => {
  nextTrack();
});

playBar.addEventListener("click", (e) => { // Pular duração de música
  if (!audio.duration) return;
  const rect = playBar.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  audio.currentTime = percent * audio.duration;
});

prevBtn.addEventListener("click", prevTrack);
nextBtn.addEventListener("click", nextTrack);

function nextTrack() { // Próxima música
  if (playlist.length === 0) return;
  currentIndex = (currentIndex + 1) % playlist.length;
  loadTrack(currentIndex);
  audio.play();
  playIcon.src = pauseImg;
}

function prevTrack() { // Voltar a música
  if (playlist.length === 0) return;
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;

  loadTrack(currentIndex);
  audio.play();
  playIcon.src = pauseImg;
}
