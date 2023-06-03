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
    sendResponse({ status: "image update success" });
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
  // Randomly assign class for background image
  let classNames = ["cat", "trump1", "trump2"];
  let randomIndex = Math.floor(Math.random() * classNames.length);
  let selectedClass = classNames[randomIndex];
  pet.classList.add(selectedClass);
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

  // * Reading time
  let article = document.querySelector("article");

  // `document.querySelector` may return null if the selector doesn't match anything.
  if (article) {
    const text = article.textContent;
    const wordMatchRegExp = /[^\s]+/g;
    const words = text.matchAll(wordMatchRegExp);

    // matchAll returns an iterator, convert to array to get word count
    const wordCount = [...words].length;
    const readingTime = Math.round(wordCount / 200);
    console.log(`readingTime: ${readingTime}`);
    const badge = document.createElement("p");

    // Use the same styling as the publish information in an article's header
    badge.classList.add("reading-time");
    badge.textContent = `⏱️ ${readingTime} min read`;

    // display reading time below header
    const heading = document.querySelector("h1");
    heading.insertAdjacentElement("afterend", badge);
  }
}

window.addEventListener("load", onload);
