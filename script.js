/* =========================================================
   ARG TERMINAL — script.js
   ========================================================= */

/* ---------------------------------------------------------
   CONFIGURAÇÃO — edita aqui à medida que criares o ARG
   --------------------------------------------------------- */

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
  // pequeno delay para garantir a transição de opacidade
  requestAnimationFrame(() => {
    mainScreen.classList.add("visible");
  });
  renderKeyDisplay("");
  keyRealInput.focus();
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
  const visibleLength = Math.max(MIN_KEY_LENGTH, value.length + 2);
  let html = "";

  for (let i = 0; i < visibleLength; i++) {
    if (i < value.length) {
      html += escapeHtml(value[i]);
    } else {
      html += '<span class="placeholder-char">_</span>';
    }
  }
  keyDisplay.innerHTML = html;
}

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
}
