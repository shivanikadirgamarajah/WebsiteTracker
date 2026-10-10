(async function () {
  const result = await window.BrainFmStorage.get(["totalTime", "trackedWebsite"]);
  const seconds = Number(result.totalTime) || 0;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  document.getElementById("time").textContent = `${hours}h ${minutes}m`;
  document.getElementById("website").textContent = result.trackedWebsite || "brain.fm";
})();
