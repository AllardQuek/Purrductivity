function onload() {
  // Add to each img tag a function to change page css when clicked
  let imgs = document.getElementsByTagName("img");

  // Add event listener to each img tag
  for (let i = 0; i < imgs.length; i++) {
    imgs[i].addEventListener("click", function () {
      // Get the id of the clicked image
      let { id } = imgs[i];
      console.log("Change pet to: " + id);

      // Update the selected image option in the storage mechanism
      chrome.storage.local.set({ selectedImage: id });

      // Trigger an event or call a function to notify the content script to update the pet image
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { message: "updatePet" });
        console.log("Message sent");
      });
    });
  }
}

window.addEventListener("load", onload);
