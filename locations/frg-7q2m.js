/* =========================================================
   frg-7q2m.js — Log 34 (transcrição com fragmentos cifrados)
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