/* =========================================================
   frg-6a73.js — reveal da página (consistente com as outras)
========================================================= */

const locMain = document.getElementById("loc-main");

document.addEventListener("DOMContentLoaded", () => {
  requestAnimationFrame(() => {
    locMain.classList.remove("hidden-init");
    requestAnimationFrame(() => {
      locMain.classList.add("visible");
    });
  });
});