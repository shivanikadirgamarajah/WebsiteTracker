console.log("Brain.fm tracker loaded!");

function setupAudioTracking() {
  const media = document.querySelector("audio, video");

  if (!media) {
    console.log("No audio element found yet.");
    return false;
  }

  console.log("Brain.fm media element found!");

  media.addEventListener("play", () => {
    console.log("Audio started");

    chrome.runtime.sendMessage({
      type: "PLAYBACK_STARTED"
    });
  });

  media.addEventListener("pause", () => {
    console.log("Audio paused");

    chrome.runtime.sendMessage({
      type: "PLAYBACK_STOPPED"
    });
  });

  media.addEventListener("ended", () => {
    console.log("Audio ended");

    chrome.runtime.sendMessage({
      type: "PLAYBACK_STOPPED"
    });
  });

  return true;
}

setupAudioTracking();