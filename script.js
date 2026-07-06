/* =========================================================
   ARG TERMINAL — script.js (Atualizado)
========================================================= */

const CURRENT_TRACK = "caffeine withdrawal";
let cursorVisible = true;
let inputFocused = false;
let uptimeSeconds = 0;

const backgroundMusic = new Audio("audio/background.ogg");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.35;

const errorSound = new Audio("audio/error.ogg");
errorSound.volume = 0.7;

/* ELEMENTOS */
const onboardingModal = document.getElementById("onboarding-modal");
const onboardingForm = document.getElementById("onboarding-form");
const onboardingError = document.getElementById("onboarding-error");

const bootScreen = document.getElementById("boot-screen");
const bootLinesEl = document.getElementById("boot-lines");

const mainScreen = document.getElementById("main-screen");
const promptLabel = document.getElementById("prompt-label");

const keyDisplay = document.getElementById("key-display");
const keyRealInput = document.getElementById("key-real-input");
const keyResponse = document.getElementById("key-response");

const terminalIcon = document.querySelector(".terminal-icon");
const fadeScreen = document.getElementById("fade-screen");

const statusUser = document.getElementById("status-user");
const statusStatus = document.getElementById("status-status");
const statusTrack = document.getElementById("status-track");
const statusUptime = document.getElementById("status-uptime");

/* BOOT LINES */
const BOOT_LINES = [
  "ARG OS v2.7.14",
  "",
  "INICIANDO SISTEMA...",
  "",
  "[■■□□□□□□□□] 15%",
  "[■■■■□□□□□□] 32%",
  "[■■■■■■□□□□] 54%",
  "[■■■■■■■■□□] 81%",
  "[■■■■■■■■■■] 100%",
  "",
  "Inicialização concluída.",
  "",
  "A carregar módulos de autenticação...",
  "✔ crypto.dll",
  "✔ archive.sys",
  "✔ gateway.node",
  "✔ user.db",
  "",
  "A sincronizar relógio do sistema...",
  "OK",
  "",
  "A verificar permissões...",
  "Permissões válidas.",
  "",
  "A montar sistema de ficheiros...",
  "OK",
  "",
  "A estabelecer ligação encriptada...",
  "",
  "[##########] 100%",
  "",
  "Nenhuma corrupção encontrada.",
  "",
  "Bem-vindo ao terminal seguro.",
  "",
  "Acesso: NÍVEL 0",
  "",
  "A aguardar autenticação..."
];

/* CHAVES */
const KEYS = {
  "ECHO9": { ok: true, message: "CHAVE ACEITE. Acesso concedido a: SETOR 1." },
  "NULLPOINT": { ok: true, message: "CHAVE ACEITE. Novo registo desbloqueado." },
  "ECHO": { ok: false, message: "Chave incompleta. Falta algo." },
  "REMEMBER THIS": { ok: true, message: "Lembraste-te. Mas não o suficiente. Continua a procurar." }
};

const DEFAULT_ERROR = "CHAVE INVÁLIDA. Tenta novamente.";

/* =========================================================
   ARRANQUE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("arg_username");

  if (!username) {
    onboardingModal.classList.remove("hidden");
  } else {
    promptLabel.textContent = "INSIRA A CHAVE DE ACESSO";
    startBoot(username);
  }
});

/* =========================================================
   ONBOARDING
========================================================= */

onboardingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const realName = document.getElementById("real-name").value.trim();
  const username = document.getElementById("username").value.trim();

  if (!realName || !username) {
    onboardingError.textContent = "Ambos os campos são obrigatórios.";
    return;
  }

  localStorage.setItem("arg_real_name", realName);
  localStorage.setItem("arg_username", username);

  onboardingModal.classList.add("hidden");
  startBoot(username);
});

/* =========================================================
   BOOT SEQUENCE + BOTÃO PROCEDER
========================================================= */

function startBoot(username) {
  bootScreen.classList.remove("hidden");
  bootLinesEl.textContent = "";

  const lines = [...BOOT_LINES, `Utilizador reconhecido: ${username}`];
  let i = 0;

  function nextLine() {
    if (i < lines.length) {
      appendBootLine(lines[i]);
      i++;
      setTimeout(nextLine, 90 + Math.random() * 160);
    } else {
      setTimeout(showProceedButton, 600);
    }
  }

  nextLine();
}

/* Remove linhas antigas para evitar overflow */
function appendBootLine(text) {
  const MAX_LINES = 22;

  const current = bootLinesEl.textContent.split("\n");
  current.push(text);

  if (current.length > MAX_LINES) {
    current.shift();
  }

  bootLinesEl.textContent = current.join("\n");
}

/* Botão para avançar */
function showProceedButton() {
  const btn = document.createElement("button");
  btn.textContent = "PROCEDER";
  btn.className = "boot-proceed-btn";

  // micro-delay para permitir que o CSS aplique animações
  setTimeout(() => {
    bootScreen.appendChild(btn);
  }, 50);

  btn.addEventListener("click", () => {
    fadeToMain();
  });
}

function fadeToMain() {
  fadeScreen.classList.add("active");

  setTimeout(() => {
    bootScreen.classList.add("hidden");

    // MOSTRAR O MAIN SCREEN
    mainScreen.classList.remove("hidden-init");

    // Fade-out do overlay
    fadeScreen.classList.remove("active");

    // Agora sim, iniciar o main screen
    showMainScreen();
  }, 800);
}

/* =========================================================
   MAIN SCREEN + AUTOPLAY FIX
========================================================= */

function showMainScreen() {
  requestAnimationFrame(() => {
    mainScreen.classList.add("visible");
  });

  renderKeyDisplay("");
  keyRealInput.focus();

  // Música toca ao clicar no botão PROCEDER
  document.addEventListener("click", () => {
    backgroundMusic.play().catch(() => {});
  }, { once: true });

  const username = localStorage.getItem("arg_username") || "UNKNOWN";

  statusUser.textContent = `USER : ${username}`;
  statusStatus.textContent = "STATUS : ONLINE";
  statusTrack.textContent = `TRACK : ${CURRENT_TRACK}`;

  updateUptime();
  setInterval(() => {
    uptimeSeconds++;
    updateUptime();
  }, 1000);
}

/* =========================================================
   UPTIME
========================================================= */

function updateUptime() {
  const h = String(Math.floor(uptimeSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((uptimeSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(uptimeSeconds % 60).padStart(2, "0");

  statusUptime.textContent = `UPTIME : ${h}:${m}:${s}`;
}

/* =========================================================
   INPUT DA CHAVE
========================================================= */

mainScreen.addEventListener("click", () => keyRealInput.focus());

keyRealInput.addEventListener("input", () => {
  renderKeyDisplay(keyRealInput.value);
});

keyRealInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkKey(keyRealInput.value);
});

keyRealInput.addEventListener("focus", () => {
  inputFocused = true;
  renderKeyDisplay(keyRealInput.value);
});

keyRealInput.addEventListener("blur", () => {
  inputFocused = false;
  renderKeyDisplay(keyRealInput.value);
});

/* =========================================================
   RENDER DO CAMPO
========================================================= */

function renderKeyDisplay(value) {
  const escaped = [...value].map(escapeHtml).join("");
  const cursor = inputFocused && (value.length > 0 || cursorVisible)
    ? '<span class="placeholder-char">|</span>'
    : "";

  keyDisplay.innerHTML = escaped + cursor;
}

setInterval(() => {
  if (inputFocused && keyRealInput.value.length === 0) {
    cursorVisible = !cursorVisible;
    renderKeyDisplay("");
  }
}, 500);

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* =========================================================
   VALIDAÇÃO DA CHAVE
========================================================= */

function checkKey(rawValue) {
  const value = rawValue.trim().toUpperCase();

  if (!value) {
    setResponse(DEFAULT_ERROR, false);
    return;
  }

  const entry = KEYS[value];
  entry
    ? setResponse(entry.message, entry.ok, value)
    : setResponse(DEFAULT_ERROR, false);
}

function setResponse(message, ok, key = "") {
  keyResponse.textContent = message;
  keyResponse.classList.toggle("ok", ok);
  keyResponse.classList.toggle("err", !ok);

  if (!ok) {
    errorSound.currentTime = 0;
    errorSound.play();
    return;
  }

  if (key === "REMEMBER THIS") {
    setTimeout(() => fadeTo("locations/loc1.html"), 1500);
  }
}

/* =========================================================
   FADE
========================================================= */

function fadeTo(page) {
  fadeScreen.classList.add("active");
  setTimeout(() => {
    window.location.href = page;
  }, 800);
}
