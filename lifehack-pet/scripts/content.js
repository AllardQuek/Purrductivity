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
  var classNames = ["cat", "trump1", "trump2"];
  var randomIndex = Math.floor(Math.random() * classNames.length);
  var selectedClass = classNames[randomIndex];
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
