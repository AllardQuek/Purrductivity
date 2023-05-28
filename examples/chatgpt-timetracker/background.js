// on first install open the options page to set the API key
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == "install") {
    chrome.tabs.create({ url: "gpt/options.html" });
  }
});

// get the current time for context in the system message
let time = new Date().toLocaleString("en-US");

// create a system message
const systemMessage =
  "You are a helpful chat bot. Your answer should not be too long. current time: " +
  time;

// initialize the message array with a system message
let messageArray = [{ role: "system", content: systemMessage }];

// a event listener to listen for a message from the content script that says the user has openend the popup
chrome.runtime.onMessage.addListener(function (request) {
  // check if the request contains a message that the user has opened the popup
  if (request.openedPopup) {
    // reset the message array to remove the previous conversation
    messageArray = [{ role: "system", content: systemMessage }];
  }
});

// listen for a request message from the content script
chrome.runtime.onMessage.addListener(async function (request) {
  // check if the request contains a message that the user sent a new message
  if (request.input) {
    // get the API key from local storage
    let apiKey = await new Promise((resolve) =>
      chrome.storage.local.get(["apiKey"], (result) => resolve(result.apiKey))
    );

    console.log(apiKey);
    // get the API model from local storage
    let apiModel = await new Promise((resolve) =>
      chrome.storage.local.get(["apiModel"], (result) =>
        resolve(result.apiModel)
      )
    );

    // Add the user's message to the message array
    messageArray.push({ role: "user", content: request.input });

    try {
      // send the request containing the messages to the OpenAI API
      let response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: apiModel,
          messages: messageArray,
        }),
      });

      // check if the API response is ok Else throw an error
      if (!response.ok) {
        throw new Error(`Failed to fetch. Status code: ${response.status}`);
      }

      // get the data from the API response as json
      let data = await response.json();

      // check if the API response contains an answer
      if (data && data.choices && data.choices.length > 0) {
        // get the answer from the API response
        let response = data.choices[0].message.content;

        // send the answer back to the content script
        chrome.runtime.sendMessage({ answer: response });

        // Add the response from the assistant to the message array
        messageArray.push({ role: "assistant", content: response });
      }
    } catch (error) {
      // send error message back to the content script
      console.log(error);
      chrome.runtime.sendMessage({
        answer: "No answer Received: Make sure the entered API-Key is correct.",
      });
    }
  }
  // return true to indicate that the message has been handled
  return true;
});

// Create context menu items
chrome.contextMenus.create({
  id: "ask-chatgpt",
  title: "Ask ChatGPT",
  contexts: ["all"],
});
chrome.contextMenus.create({
  id: "usage-time",
  title: "Usage Time",
  contexts: ["all"],
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "ask-chatgpt") {
    chrome.windows.create(
      {
        url: "gpt/gpt.html",
        type: "popup",
        width: 400,
        height: 300,
      },
      function (window) {
        // Execute script in the pop-up window
        chrome.scripting.executeScript({
          target: { tabId: window.tabs[0].id, allFrames: true },
          files: ["gpt/gpt.js"],
        });
      }
    );
  } else if (info.menuItemId == "usage-time") {
    chrome.windows.create(
      {
        url: "features/tracker.html",
        type: "popup",
        width: 400,
        height: 300,
      },
      function (window) {
        // Execute script in the pop-up window
        chrome.scripting.executeScript({
          target: { tabId: window.tabs[0].id, allFrames: true },
          files: ["features/tracker.js"],
        });
      }
    );
  }
});

// Create Commands
// chrome.commands.onCommand.addListener(function (command) {
//   if (command === "command1") {
//     // Perform the actions for command 1
//     console.log("Command 1 executed");
//     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//       chrome.scripting.executeScript({
//         target: { tabId: tabs[0].id, allFrames: true },
//         files: ["features/reading.js"],
//       });
//     });
//   } else if (command === "command2") {
//     // Perform the actions for command 2
//     console.log("Command 2 executed");
//     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//       chrome.scripting.executeScript({
//         target: { tabId: tabs[0].id, allFrames: true },
//         files: ["features/pet.js"],
//       });
//     });
//   } else {
//     console.log(`Command: ${command}`);
//   }
// });

// Time Tracker
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

chrome.runtime.onInstalled.addListener(async function () {
  await initialize();
});

chrome.runtime.onStartup.addListener(async function () {
  await initialize();
});

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
async function initialize() {
  const d = new Date();
  colDate = `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  await chrome.storage.local.clear();
  await chrome.storage.local.set({ tracker: {} });
  await chrome.storage.local.set({ collectionDate: colDate });
}
