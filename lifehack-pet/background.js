let isFocusModeOn = false;

chrome.action.onClicked.addListener(async (tab) => {
  if (!isFocusModeOn) {
    isFocusModeOn = true;
    // Insert the CSS file when the user turns the extension on
    await chrome.scripting.insertCSS({
      files: ["focus-mode.css"],
      target: { tabId: tab.id },
    });
  } else {
    isFocusModeOn = false;
    // Remove the CSS file when the user turns the extension off
    await chrome.scripting.removeCSS({
      files: ["focus-mode.css"],
      target: { tabId: tab.id },
    });
  }
});
