// * Initialize the extension
let isFocusModeOn = false;
let isTimeTrackerDisplayed = false;

chrome.runtime.onInstalled.addListener(async function () {
  await initialize();
});

chrome.runtime.onStartup.addListener(async function () {
  await initialize();
});

// * Handle commands
chrome.commands.onCommand.addListener(function (command) {
  switch (command) {
    case "focus-mode":
      toggleFocusMode();
      break;
    case "duplicate-tab":
      duplicateTab();
      break;
    case "time-tracker":
      // Open the time tracker popup
      toggleTimeTracker();
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
    chrome.tabs.create({ url: tabs[0].url, active: false });
  });
}

/**
 * Toggles the focus mode on and off
 */
async function toggleFocusMode() {
  const query = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(query);

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
}

/**
 * Clear local storage and initialize values
 */
async function initialize() {
  const d = new Date();
  colDate = `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  await chrome.storage.local.clear();
  await chrome.storage.local.set({ tracker: {} });
  await chrome.storage.local.set({ collectionDate: colDate });
}

// * Time Tracker
let currentUrl = null;
let colDate = null;
let captureTime = null;

async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function saveToLS(siteUrl) {
  if (siteUrl) {
    if (captureTime !== null) {
      clearInterval(captureTime);
    }
    captureTime = setInterval(captureTimeFunc(siteUrl), 1000);
  }
}

function captureTimeFunc(siteUrl) {
  return async () => {
    let localStore = await chrome.storage.local.get(["tracker"]);
    let sitesMap = new Map(Object.entries(localStore.tracker || {}));
    if (sitesMap.has(siteUrl)) {
      sitesMap.set(siteUrl, sitesMap.get(siteUrl) + 1);
    } else {
      sitesMap.set(siteUrl, 0);
    }
    await chrome.storage.local.set({ tracker: Object.fromEntries(sitesMap) });
  };
}

function extractUrl(tabInfo) {
  const fields = tabInfo.url.split("/");
  let urlExtracted =
    fields[0] === "https:" || fields[0] === "http:" ? fields[2] : fields[0];
  return urlExtracted.replace(":", "");
}

async function updateTabInfo(tab) {
  const siteUrl = extractUrl(tab);
  if (currentUrl !== siteUrl) {
    currentUrl = siteUrl;
    await saveToLS(siteUrl);
  }
}

chrome.tabs.onActivated.addListener(async function (activeInfo) {
  const [tab] = await chrome.tabs.query({
    active: true,
    windowId: activeInfo.windowId,
  });
  await updateTabInfo(tab);
});

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  if (changeInfo.url) {
    await updateTabInfo(tab);
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === -1) {
    if (captureTime !== null) {
      clearInterval(captureTime);
    }
  } else {
    const [tab] = await chrome.tabs.query({ active: true, windowId: windowId });
    await updateTabInfo(tab);
  }
});
