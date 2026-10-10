(async function () {
  const result = await window.BrainFmStorage.get(["totalTime", "trackedWebsites", "trackedWebsite"]);
  const seconds = Number(result.totalTime) || 0;
  const websites = Array.isArray(result.trackedWebsites) && result.trackedWebsites.length
    ? result.trackedWebsites.map((site) => typeof site === "string" ? site : site.hostname)
    : (result.trackedWebsite ? [result.trackedWebsite] : ["brain.fm"]);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  document.getElementById("time").textContent = `${hours}h ${minutes}m`;
  document.getElementById("website").textContent = websites.length > 1 ? websites.join(", ") : (websites[0] || "brain.fm");
})();
