const intro = document.getElementById("intro");
const main = document.getElementById("main");
const container = document.querySelector("#main .container");
const title = document.querySelector(".title");
const subtitle = document.getElementById("subtitle");
const handle = document.getElementById("handle");
const email = document.getElementById("email");

// Fade out intro
setTimeout(() => {
  intro.classList.add("hidden");
}, 2000);

// Show main container + title pop
setTimeout(() => {
  intro.style.display = "none";
  main.classList.add("visible");
  title.classList.add("pop-in");
}, 3000);

// Shift up + reveal subtitle
setTimeout(() => {
  main.classList.add("shift-1");
  subtitle.classList.add("fade-in");
}, 4500);

// Shift again + stagger meta
setTimeout(() => {
  main.classList.remove("shift-1");
  main.classList.add("shift-2");
  handle.classList.add("fade-in");
}, 6000);

setTimeout(() => {
  main.classList.remove("shift-2");
  main.classList.add("shift-3");
  email.classList.add("fade-in");
}, 7500);

// Idle breathing
setTimeout(() => {
  container.classList.add("idle");
}, 8000);
