chrome.storage.local.get(["totalTime"], (result) => {
  const seconds = result.totalTime || 0;

  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  document.getElementById("time").textContent =
    `${hours}h ${minutes}m`;
});