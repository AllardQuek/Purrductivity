const position = {
  x: 0,
  y: 0,
};

function updatePosition(pet, x, y) {
  pet.style.left = (position.x = x) + "px";
  pet.style.top = (position.y = y) + "px";
}
function onload() {
  const pet = document.createElement("div");
  updatePosition(pet, 100, 100);
  console.log(pet);
  pet.classList.add("ssh-pet");
  document.body.appendChild(pet);
}
window.addEventListener("load", onload);
