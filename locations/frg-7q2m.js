/* =========================================================
   frg-7q2m.js — Cifra interativa (puzzle de reordenação)
========================================================= */

const locMain = document.getElementById("loc-main");
const fadeScreen = document.getElementById("fade-screen");
const tilesWrap = document.getElementById("cipher-tiles");
const cipherResult = document.getElementById("cipher-result");

/* -----------------------------------------------------------
   CONFIGURAÇÃO DO PUZZLE
   Muda SOLUTION e RESULT_MESSAGE para o teu próprio enigma.
   SOLUTION tem de ser só letras/números, sem espaços.
----------------------------------------------------------- */
const SOLUTION = "TEIAS";
const RESULT_MESSAGE = "TEIAS. Cada um deles fazia parte dela sem saber. Regista este fragmento e usa-o no terminal principal.";

let tiles = [];
let selectedIndex = null;
let solved = false;

function shuffle(arr) {
  const a = [...arr];
  do {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  } while (a.join("") === SOLUTION);
  return a;
}

function buildTiles() {
  tiles = shuffle(SOLUTION.split(""));
  tilesWrap.innerHTML = "";

  tiles.forEach((char, i) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "cipher-tile";
    tile.textContent = char;
    tile.setAttribute("aria-label", `fragmento ${i + 1}: ${char}`);
    tile.addEventListener("click", () => onTileClick(i));
    tilesWrap.appendChild(tile);
  });
}

function onTileClick(index) {
  if (solved) return;

  const tileEls = tilesWrap.querySelectorAll(".cipher-tile");

  if (selectedIndex === null) {
    selectedIndex = index;
    tileEls[index].classList.add("selected");
    return;
  }

  if (selectedIndex === index) {
    tileEls[index].classList.remove("selected");
    selectedIndex = null;
    return;
  }

  // troca os dois fragmentos
  [tiles[selectedIndex], tiles[index]] = [tiles[index], tiles[selectedIndex]];

  tileEls[selectedIndex].classList.remove("selected");
  selectedIndex = null;

  renderTiles();
  checkSolved();
}

function renderTiles() {
  const tileEls = tilesWrap.querySelectorAll(".cipher-tile");
  tiles.forEach((char, i) => {
    tileEls[i].textContent = char;
  });
}

function checkSolved() {
  if (tiles.join("") !== SOLUTION) return;

  solved = true;
  const tileEls = tilesWrap.querySelectorAll(".cipher-tile");
  tileEls.forEach(el => el.classList.add("solved"));

  cipherResult.textContent = RESULT_MESSAGE;
  cipherResult.classList.add("visible");
}

document.addEventListener("DOMContentLoaded", () => {
  buildTiles();

  requestAnimationFrame(() => {
    locMain.classList.remove("hidden-init");
    requestAnimationFrame(() => {
      locMain.classList.add("visible");
    });
  });
});