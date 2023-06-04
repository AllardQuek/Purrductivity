// Listen for messages from the popup script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );
  if (request.message === "updatePet") {
    console.log(`Message: ${request.message}`);
    updatePet();
    sendResponse({ status: "Image update success" });
  }
});

function updatePet() {
  // Get the selected image option from the storage mechanism
  chrome.storage.local.get(["selectedImage"], function (result) {
    // Get the selected image option from the storage mechanism
    const { selectedImage } = result;
    console.log("Selected image: " + selectedImage);

    // Get the pet element
    const pet = document.querySelector(".pet");

    // Remove all classes from the pet element
    pet.classList.remove(...pet.classList);

    // Add the pet class and the selected image class to the pet element
    pet.classList.add("pet", selectedImage);
  });
}

// Comment out top so it wont affect y axis
function setRandomPosition(element) {
  const screenWidth = window.innerWidth;
  // const screenHeight = window.innerHeight;
  const left = Math.random() * (screenWidth - element.offsetWidth);
  // const top = Math.random() * (screenHeight - element.offsetHeight);

  element.style.left = left + "px";
  // element.style.top = top + "px";
}

// * Show pet
function onload() {
  const pet = document.createElement("div");
  pet.classList.add("pet");

  // Check if there is a selected image option from the storage mechanism
  chrome.storage.local.get(["selectedImage"], function (result) {
    // Get the selected image option from the storage mechanism
    let { selectedImage } = result;
    console.log("Selected image: " + selectedImage);

    if (!selectedImage) {
      // Randomly assign class for background image
      const classNames = ["cat", "cat1", "cat2", "trump1", "trump2"];
      const randomIndex = Math.floor(Math.random() * classNames.length);
      selectedImage = classNames[randomIndex];
      console.log(`Randomly selected image: ${selectedImage}`);
    }

    // Add the pet class and the selected image class to the pet element
    pet.classList.add("pet", selectedImage);
  });

  document.body.appendChild(pet);
  const petElement = document.querySelector(".pet");
  // Set the initial random position for the pet
  setRandomPosition(petElement);

  const emojis = ["❤️", "🚀", "🤩", "😳", "🥰", "💩"];

  pet.addEventListener("mouseover", () => {
    const randomIndex = Math.floor(Math.random() * emojis.length);
    const randomEmoji = emojis[randomIndex];
    pet.setAttribute("data-emoji", randomEmoji);
  });

  // Clear the emoji when the mouse moves away
  pet.addEventListener("mouseout", () => {
    pet.removeAttribute("data-emoji");
  });
}

window.addEventListener("load", onload);
