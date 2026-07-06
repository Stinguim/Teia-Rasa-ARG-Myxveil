/* =========================================================
   loc1.js — Sequência de recuperação de acesso
========================================================= */

const locBoot = document.getElementById("loc-boot");
const locBootLines = document.getElementById("loc-boot-lines");
const locMain = document.getElementById("loc-main");
const fadeScreen = document.getElementById("fade-screen");

const RECOVERY_LINES = [
  "AVISO: TENTATIVA DE AUTENTICAÇÃO FALHADA",
  "PASSWORD NÃO RECONHECIDA PELO SISTEMA",
  "",
  "> A ATIVAR OPERAÇÃO DE RECUPERAÇÃO DE ACESSO...",
  "[OK] Ligação ao núcleo da TEIA RASA estabelecida",
  "[OK] Pedido de redefinição registado",
  "[OK] Protocolo de emergência ativado",
  "",
  "A verificar permissões do requerente...",
  "[AVISO] Identidade não totalmente verificada",
  "",
  "Por motivos de segurança, o sistema não pode devolver",
  "a password na íntegra.",
  "Em alternativa, será libertado um fragmento do código",
  "de acesso original, como prova de vida do sistema.",
  "",
  "A descodificar fragmento..."
];

let lineIndex = 0;

function nextLine() {
  if (lineIndex < RECOVERY_LINES.length) {
    appendLine(RECOVERY_LINES[lineIndex]);
    lineIndex++;
    setTimeout(nextLine, 90 + Math.random() * 160);
  } else {
    setTimeout(revealEnigma, 700);
  }
}

function appendLine(text) {
  const current = locBootLines.textContent.length
    ? locBootLines.textContent.split("\n")
    : [];
  current.push(text);
  locBootLines.textContent = current.join("\n");
}

function revealEnigma() {
  fadeScreen.classList.add("active");

  setTimeout(() => {
    locBoot.classList.add("hidden");
    locMain.classList.remove("hidden-init");
    fadeScreen.classList.remove("active");

    requestAnimationFrame(() => {
      locMain.classList.add("visible");
    });
  }, 800);
}

document.addEventListener("DOMContentLoaded", () => {
  nextLine();
});