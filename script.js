/* =========================================================
   ARG TERMINAL — script.js (com temas + sons via config.json)
========================================================= */

let CONFIG = null;
let cursorVisible = true;
let inputFocused = false;
let uptimeSeconds = 0;

let backgroundMusic;
let errorSound;
let clickSound;
let bootSound;

/* ELEMENTOS */
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

/* =========================================================
   LOAD CONFIG.JSON
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  CONFIG = await fetch("config.json").then(r => r.json());

  /* Sons */
  backgroundMusic = new Audio(CONFIG.audio.background);
  backgroundMusic.loop = true;
  backgroundMusic.volume = CONFIG.audio.volume;

  errorSound = new Audio(CONFIG.audio.error);
  clickSound = new Audio(CONFIG.audio.click);
  bootSound = new Audio(CONFIG.audio.boot);

  keySound = new Audio(CONFIG.audio.key);
  keySound.volume = 0.5;

  accessSound = new Audio(CONFIG.audio.access);
  accessSound.volume = 0.7;

  /* Aplicar tema ao CSS */
  applyTheme(CONFIG.theme);

  /* Autoplay fix */
  document.addEventListener("click", () => {
    backgroundMusic.play().catch(() => {});
  }, { once: true });

  promptLabel.textContent = "INSIRA A CHAVE DE ACESSO";

  startBoot(CONFIG.username);
});

/* =========================================================
   APLICAR TEMA AO CSS
========================================================= */

function applyTheme(theme) {
  const root = document.documentElement;

  root.style.setProperty("--bg", theme.colors.bg);
  root.style.setProperty("--green", theme.colors.primary);
  root.style.setProperty("--green-dim", theme.colors.dim);
  root.style.setProperty("--green-faint", theme.colors.faint);
  root.style.setProperty("--amber-error", theme.colors.error);

  /* CRT extras */
  if (!theme.crt.scanlines) {
    document.body.style.setProperty("--disable-scanlines", "true");
  }
}

/* =========================================================
   BOOT SEQUENCE + BOTÃO PROCEDER
========================================================= */

function startBoot(username) {
  bootScreen.classList.remove("hidden");
  bootLinesEl.textContent = "";

  bootSound.play().catch(() => {});

  const lines = [...CONFIG.boot.lines, `Utilizador reconhecido: ${username}`];
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

/* Scroll inteligente */
function appendBootLine(text) {
  const MAX_LINES = CONFIG.bootMaxLines;

  const current = bootLinesEl.textContent.split("\n");
  current.push(text);

  if (current.length > MAX_LINES) {
    current.shift();
  }

  bootLinesEl.textContent = current.join("\n");
}

/* Botão PROCEDER */
function showProceedButton() {
  const btn = document.createElement("button");
  btn.textContent = "PROCEDER";
  btn.className = "boot-proceed-btn";

  setTimeout(() => {
    bootScreen.appendChild(btn);
  }, 50);

  btn.addEventListener("click", () => {
    clickSound.play().catch(() => {});
    fadeToMain();
  });
}

function fadeToMain() {
  fadeScreen.classList.add("active");

  setTimeout(() => {
    bootScreen.classList.add("hidden");

    mainScreen.classList.remove("hidden-init");
    fadeScreen.classList.remove("active");

    showMainScreen();
  }, 800);
}

/* =========================================================
   MAIN SCREEN
========================================================= */

function showMainScreen() {
  requestAnimationFrame(() => {
    mainScreen.classList.add("visible");
  });

  renderKeyDisplay("");
  keyRealInput.focus();

  statusUser.textContent = `USER : ${CONFIG.username}`;
  statusStatus.textContent = "STATUS : ONLINE";
  statusTrack.textContent = `TRACK : ${CONFIG.track}`;

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

let lastKeySound = 0;

mainScreen.addEventListener("click", () => keyRealInput.focus());

keyRealInput.addEventListener("input", () => {
  renderKeyDisplay(keyRealInput.value);

  const now = performance.now();

  // cooldown para evitar spam
  if (now - lastKeySound > 20) {
    keySound.currentTime = 0;
    keySound.play().catch(() => {});
    lastKeySound = now;
  }
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
    setResponse("CHAVE INVÁLIDA. Tenta novamente.", false);
    return;
  }

  const entry = CONFIG.keys[value];
  entry
    ? setResponse(entry.message, entry.ok, value)
    : setResponse("CHAVE INVÁLIDA. Tenta novamente.", false);
}

let responseTypeToken = 0;

function setResponse(message, ok, key = "") {
  keyResponse.classList.toggle("ok", ok);
  keyResponse.classList.toggle("err", !ok);

  typeResponse(message);

  if (!ok) {
    errorSound.currentTime = 0;
    errorSound.play();
    return;
  }

  // Som de acesso concedido
  accessSound.currentTime = 0;
  accessSound.play().catch(() => {});

  // Chave especial que muda de página
  if (key === "REMEMBER THIS") {
    setTimeout(() => fadeTo("locations/loc1.html"), 1500);
  }
}

/* Escreve a mensagem de resposta letra a letra */
function typeResponse(message) {
  const token = ++responseTypeToken;
  keyResponse.textContent = "";

  let i = 0;

  function typeChar() {
    if (token !== responseTypeToken) return; // resposta cancelada por uma nova
    if (i <= message.length) {
      keyResponse.textContent = message.slice(0, i);
      i++;
      setTimeout(typeChar, 25 + Math.random() * 35);
    }
  }

  typeChar();
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