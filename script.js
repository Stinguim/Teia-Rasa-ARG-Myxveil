/* =========================================================
   ARG TERMINAL — script.js
   ========================================================= */

/* ---------------------------------------------------------
   CONFIGURAÇÃO — edita aqui à medida que criares o ARG
   --------------------------------------------------------- */

// Permitir alterar o cursor
let cursorVisible = true;
// mini glitch no icon
const terminalIcon = document.querySelector(".terminal-icon");
// Mensagens da sequência de arranque (podes reescrever livremente)
const BOOT_LINES = [
  "INICIANDO SISTEMA...",
  "A verificar integridade dos módulos... [OK]",
  "A estabelecer ligação segura...",
  "Ligação estabelecida.",
  "A carregar protocolo de acesso...",
  "AVISO: sessão não autenticada detetada",
  "Acesso: NÍVEL 0",
  "Aguardando credenciais...",
];

// Comprimento mínimo do campo de chave (nº de underscores visíveis
// quando o campo está vazio). O campo cresce automaticamente se o
// utilizador escrever mais do que isto.
const MIN_KEY_LENGTH = 10;

// Mapa de chaves -> resposta mostrada ao utilizador.
// Adiciona aqui uma entrada por cada chave que espalhares pelo ARG.
// A comparação não é sensível a maiúsculas/minúsculas nem a espaços extra.
const KEYS = {
  "ECHO9": {
    ok: true,
    message: "CHAVE ACEITE. Acesso concedido a: SETOR 1.",
  },
  "NULLPOINT": {
    ok: true,
    message: "CHAVE ACEITE. Novo registo desbloqueado.",
  },
  // exemplo de chave "quase certa" para dar uma pista em vez de erro genérico:
  "ECHO": {
    ok: false,
    message: "Chave incompleta. Falta algo.",
  },
};

const DEFAULT_ERROR = "CHAVE INVÁLIDA. Tenta novamente.";
/* ---------------------------------------------------------
   ÁUDIO
--------------------------------------------------------- */

const backgroundMusic = new Audio("audio/background.ogg");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.35;

const errorSound = new Audio("audio/error.ogg");
errorSound.volume = 0.7;

/* ---------------------------------------------------------
   ELEMENTOS
   --------------------------------------------------------- */
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

/* ---------------------------------------------------------
   ARRANQUE GERAL
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("arg_username");

  if (!username) {
    onboardingModal.classList.remove("hidden");
  } else {
    promptLabel.textContent = `INSIRA A CHAVE DE ACESSO`;
    startBoot(username);
  }
});

/* ---------------------------------------------------------
   MODAL DE ONBOARDING
   --------------------------------------------------------- */
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

/* ---------------------------------------------------------
   SEQUÊNCIA DE ARRANQUE
   --------------------------------------------------------- */
function startBoot(username) {
  bootScreen.classList.remove("hidden");
  bootLinesEl.textContent = "";

  const lines = [...BOOT_LINES, `Utilizador reconhecido: ${username}`];

  let i = 0;
  function nextLine() {
    if (i < lines.length) {
      bootLinesEl.textContent += lines[i] + "\n";
      i++;
      // velocidade um pouco irregular, para parecer mais "real"
      setTimeout(nextLine, 90 + Math.random() * 160);
    } else {
      // pequena pausa antes de apagar tudo e ficar em ecrã preto
      setTimeout(() => {
        bootScreen.classList.add("hidden");
        bootScreen.style.display = "none";
        setTimeout(showMainScreen, 500);
      }, 500);
    }
  }
  nextLine();
}

function showMainScreen() {
  mainScreen.classList.remove("hidden-init");

  requestAnimationFrame(() => {
    mainScreen.classList.add("visible");
  });

  renderKeyDisplay("");
  keyRealInput.focus();

  // inicia música
  backgroundMusic.volume = 0;
  backgroundMusic.play().catch(() => {});

  let volume = 0;

  const fade = setInterval(() => {
      volume += 0.02;

      if (volume >= 0.35) {
          volume = 0.35;
          clearInterval(fade);
      }

      backgroundMusic.volume = volume;
  }, 100);

  terminalIcon.animate([
      {
          transform:"scale(.85)",
          opacity:0
      },
      {
          transform:"scale(1.05)",
          opacity:1
      },
      {
          transform:"scale(1)",
          opacity:1
      }
  ],{
      duration:650,
      easing:"ease-out"
  });
}

/* ---------------------------------------------------------
   CAMPO DA CHAVE (underscores dinâmicos)
   --------------------------------------------------------- */
mainScreen.addEventListener("click", () => keyRealInput.focus());

keyRealInput.addEventListener("input", () => {
  renderKeyDisplay(keyRealInput.value);
});

keyRealInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    checkKey(keyRealInput.value);
  }
});

function renderKeyDisplay(value) {
    let html = "";

    for (let i = 0; i < value.length; i++) {
        html += escapeHtml(value[i]);
    }

    // Se houver texto, mostra sempre o cursor fixo
    if (value.length > 0) {
        html += '<span class="placeholder-char">|</span>';
    }
    // Se estiver vazio, usa a animação
    else if (cursorVisible) {
        html += '<span class="placeholder-char">|</span>';
    }

    keyDisplay.innerHTML = html;
}

cursorInterval = setInterval(() => {

    // Só anima quando o campo está vazio
    if (keyRealInput.value.length === 0) {
        cursorVisible = !cursorVisible;
        renderKeyDisplay("");
    }

}, 500);

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---------------------------------------------------------
   VALIDAÇÃO DA CHAVE
   --------------------------------------------------------- */
function checkKey(rawValue) {
  const value = rawValue.trim().toUpperCase();

  if (!value) {
    setResponse(DEFAULT_ERROR, false);
    return;
  }

  const entry = KEYS[value];

  if (entry) {
    setResponse(entry.message, entry.ok);
  } else {
    setResponse(DEFAULT_ERROR, false);
  }
}

function setResponse(message, ok) {
  keyResponse.textContent = message;
  keyResponse.classList.remove("ok", "err");
  keyResponse.classList.add(ok ? "ok" : "err");

  if (!ok) {
    errorSound.currentTime = 0;
    errorSound.play();
  }
}

setInterval(() => {

    if (!terminalIcon) return;

    terminalIcon.style.transform =
        `translate(${Math.random()*2-1}px, ${Math.random()*2-1}px)`;

    setTimeout(() => {
        terminalIcon.style.transform = "";
    }, 40);

}, 7000 + Math.random()*6000);
