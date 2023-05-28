// * Show pet
function onload() {
  const pet = document.createElement("div");
  pet.classList.add("pet");
  document.body.appendChild(pet);

  // * Reading time
  let article = document.querySelector("article");

  /* Straits Times: blocks extension
  if (!article) {
    article = document.querySelector(".article-content-rawhtml");
  }
  */

  console.log(`article: ${article}`);

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