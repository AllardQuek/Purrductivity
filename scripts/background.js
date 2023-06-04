// * Handle commands
chrome.commands.onCommand.addListener(function (command) {
  switch (command) {
    case "duplicate-tab":
      duplicateTab();
      break;
    default:
      console.log(`Command ${command} not found`);
  }
});

/**
 * Duplicates the current active tab
 */
function duplicateTab() {
  const query = { active: true, currentWindow: true };
  chrome.tabs.query(query, (tabs) => {
    chrome.tabs.create({ url: tabs[0].url, active: true });
  });
}
