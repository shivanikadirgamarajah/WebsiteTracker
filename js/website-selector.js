(function () {
  function normalizeWebsite(value) {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new Error("Enter a valid website, such as brain.fm or https://example.com.");
    }

    const withProtocol = trimmed.includes("://") ? trimmed : `https://${trimmed}`;
    const url = new URL(withProtocol);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "").replace(/\.$/, "");
    const validHostname = hostname === "localhost" || (
      hostname.includes(".") &&
      hostname.split(".").every((part) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(part))
    );

    if (
      /\s/.test(trimmed) ||
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      !validHostname
    ) {
      throw new Error("Enter a valid website, such as brain.fm or https://example.com.");
    }

    return {
      hostname,
      address: `${url.protocol}//${url.host}`
    };
  }

  function getTrackedWebsites(result = {}) {
    const savedWebsites = Array.isArray(result.trackedWebsites) ? result.trackedWebsites : [];

    if (savedWebsites.length > 0) {
      return savedWebsites.filter((site) => site && (site.hostname || site)).map((site) => ({
        hostname: typeof site === "string" ? site : (site.hostname || "").toLowerCase(),
        address: typeof site === "string" ? `https://${site}` : (site.address || `https://${site.hostname}`)
      })).filter((site) => site.hostname);
    }

    const legacyHostname = result.trackedWebsite;
    if (legacyHostname) {
      return [{
        hostname: String(legacyHostname).toLowerCase(),
        address: result.trackedWebsiteUrl || `https://${legacyHostname}`
      }];
    }

    return [{
      hostname: "brain.fm",
      address: "https://brain.fm"
    }];
  }

  function setWebsiteDisplay(websites) {
    const selectedWebsites = document.getElementById("selected-websites");
    const openWebsite = document.getElementById("open-website");

    if (!selectedWebsites || !openWebsite) {
      return;
    }

    const safeWebsites = (websites || []).filter(Boolean);
    const firstWebsite = safeWebsites[0] || { hostname: "brain.fm", address: "https://brain.fm" };

    selectedWebsites.innerHTML = safeWebsites.length
      ? safeWebsites.map((site) => `
          <span class="website-pill">
            ${site.hostname}
            <button class="remove-site" type="button" data-remove-website="${site.hostname}" aria-label="Remove ${site.hostname}">×</button>
          </span>
        `).join("")
      : '<span class="website-pill">brain.fm</span>';

    openWebsite.href = firstWebsite.address || `https://${firstWebsite.hostname}`;

    selectedWebsites.querySelectorAll("[data-remove-website]").forEach((button) => {
      button.addEventListener("click", async () => {
        const hostnameToRemove = button.getAttribute("data-remove-website");
        const existing = await window.BrainFmStorage.get(["trackedWebsites", "trackedWebsite"]);
        const websitesList = getTrackedWebsites(existing);
        const nextWebsites = websitesList.filter((site) => site.hostname !== hostnameToRemove);

        if (nextWebsites.length === 0) {
          await window.BrainFmStorage.set({
            trackedWebsites: [],
            trackedWebsite: "brain.fm",
            trackedWebsiteUrl: "https://brain.fm"
          });
        } else {
          await window.BrainFmStorage.set({
            trackedWebsites: nextWebsites,
            trackedWebsite: nextWebsites[0].hostname,
            trackedWebsiteUrl: nextWebsites[0].address
          });
        }

        const refreshed = await window.BrainFmStorage.get(["trackedWebsites", "trackedWebsite", "trackedWebsiteUrl"]);
        setWebsiteDisplay(getTrackedWebsites(refreshed));
      });
    });
  }

  function setStatus(message, kind = "success") {
    const status = document.getElementById("website-status");
    if (!status) {
      return;
    }

    status.textContent = message;
    status.dataset.kind = kind;
  }

  function initWebsiteSelector() {
    const form = document.getElementById("website-form");
    const input = document.getElementById("website-input");
    const saveButton = document.getElementById("save-website");

    if (!form || !input || !saveButton) {
      return;
    }

    const syncSavedWebsite = async () => {
      const result = await window.BrainFmStorage.get(["trackedWebsites", "trackedWebsite", "trackedWebsiteUrl"]);
      setWebsiteDisplay(getTrackedWebsites(result));
    };

    input.addEventListener("input", () => {
      input.removeAttribute("aria-invalid");
      setStatus("");
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      let website;

      try {
        website = normalizeWebsite(input.value);
      } catch {
        input.setAttribute("aria-invalid", "true");
        setStatus("Enter a valid website, such as brain.fm or https://example.com.", "error");
        input.focus();
        return;
      }

      saveButton.disabled = true;
      saveButton.textContent = "Saving…";

      try {
        const existing = await window.BrainFmStorage.get(["trackedWebsites", "trackedWebsite", "trackedWebsiteUrl"]);
        const trackedWebsites = getTrackedWebsites(existing);
        const hasWebsite = trackedWebsites.some((item) => item.hostname === website.hostname);

        const nextWebsites = hasWebsite
          ? trackedWebsites
          : [...trackedWebsites, { hostname: website.hostname, address: website.address }];

        await window.BrainFmStorage.set({
          trackedWebsites: nextWebsites,
          trackedWebsite: nextWebsites[0].hostname,
          trackedWebsiteUrl: nextWebsites[0].address
        });

        setWebsiteDisplay(nextWebsites);
        input.value = website.hostname;
        input.removeAttribute("aria-invalid");
        setStatus(`Saved. Audio playback on ${website.hostname} will now be tracked.`);
      } catch {
        setStatus("Your website could not be saved. Please try again.", "error");
      } finally {
        saveButton.disabled = false;
        saveButton.textContent = "Save website";
      }
    });

    syncSavedWebsite();

    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && (changes.trackedWebsites || changes.trackedWebsite || changes.trackedWebsiteUrl)) {
          syncSavedWebsite();
        }
      });
    }
  }

  window.websiteSelector = {
    init: initWebsiteSelector
  };
})();
