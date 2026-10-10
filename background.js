let startTime = null;
let trackedTabId = null;
let trackedWebsite = "brain.fm";

const websiteReady = new Promise((resolve) => {
  chrome.storage.local.get(["trackedWebsite"], (result) => {
    trackedWebsite = result.trackedWebsite || "brain.fm";
    resolve();
    findPlayingTab();
  });
});

function matchesWebsite(address) {
  try {
    const url = new URL(address);
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    return ["http:", "https:"].includes(url.protocol) && (
      hostname === trackedWebsite || hostname.endsWith(`.${trackedWebsite}`)
    );
  } catch {
    return false;
  }
}

function startTimer(tab) {
  if (startTime === null && tab.audible === true && matchesWebsite(tab.url)) {
    startTime = Date.now();
    trackedTabId = tab.id;
  }
}

function findPlayingTab() {
  chrome.tabs.query({ audible: true }, (tabs) => {
    tabs.forEach(startTimer);
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  websiteReady.then(() => {
    if (trackedTabId === tabId && (!matchesWebsite(tab.url) || changeInfo.audible === false)) {
      stopTimer();
      findPlayingTab();
    }

    startTimer(tab);
  });
});

function stopTimer() {
  if (startTime === null) {
    return;
  }

  const elapsedSeconds = Math.floor(
    (Date.now() - startTime) / 1000
  );

  chrome.storage.local.get(["totalTime"], (result) => {
    const oldTime = result.totalTime || 0;

    const newTime = oldTime + elapsedSeconds;

    chrome.storage.local.set({
      totalTime: newTime
    });
  });

  startTime = null;
  trackedTabId = null;
}

chrome.tabs.onRemoved.addListener((tabId) => {
  if (
    tabId === trackedTabId &&
    startTime !== null
  ) {
    stopTimer();
    findPlayingTab();
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.trackedWebsite) {
    websiteReady.then(() => {
      stopTimer();
      trackedWebsite = changes.trackedWebsite.newValue || "brain.fm";
      findPlayingTab();
    });
  }
});
