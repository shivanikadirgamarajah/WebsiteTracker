let startTime = null;
let brainFmTabId = null;

console.log("Brain.fm background tracker started");

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only care about Brain.fm
  if (!tab.url || !tab.url.includes("brain.fm")) {
    return;
  }

  console.log("Brain.fm tab updated:", {
    tabId: tabId,
    audible: tab.audible,
    changeInfo: changeInfo
  });

  // Brain.fm started producing sound
  if (tab.audible === true) {
    if (startTime === null) {
      startTime = Date.now();
      brainFmTabId = tabId;

      console.log(" Brain.fm audio started");
    }
  }

  // Brain.fm stopped producing sound
  if (
    changeInfo.audible === false &&
    startTime !== null &&
    brainFmTabId === tabId
  ) {
    stopTimer();
  }
});

function stopTimer() {
  if (startTime === null) {
    return;
  }

  const elapsedSeconds = Math.floor(
    (Date.now() - startTime) / 1000
  );

  console.log(
    `Session finished: ${elapsedSeconds} seconds`
  );

  chrome.storage.local.get(["totalTime"], (result) => {
    const oldTime = result.totalTime || 0;

    const newTime = oldTime + elapsedSeconds;

    chrome.storage.local.set({
      totalTime: newTime
    });

    console.log(
      `Total Brain.fm time: ${newTime} seconds`
    );
  });

  startTime = null;
  brainFmTabId = null;
}


chrome.tabs.onRemoved.addListener((tabId) => {
  if (
    tabId === brainFmTabId &&
    startTime !== null
  ) {
    console.log("Brain.fm tab closed");

    stopTimer();
  }
});
