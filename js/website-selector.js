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

  function setWebsiteDisplay(hostname, address = `https://${hostname}`) {
    const currentWebsite = document.getElementById("current-website");
    const openWebsite = document.getElementById("open-website");

    if (!currentWebsite || !openWebsite) {
      return;
    }

    currentWebsite.textContent = hostname;
    openWebsite.href = address;
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
      const result = await window.BrainFmStorage.get(["trackedWebsite", "trackedWebsiteUrl"]);
      setWebsiteDisplay(result.trackedWebsite || "brain.fm", result.trackedWebsiteUrl || "https://brain.fm");
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
        await window.BrainFmStorage.set({
          trackedWebsite: website.hostname,
          trackedWebsiteUrl: website.address
        });

        setWebsiteDisplay(website.hostname, website.address);
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
        if (area === "local" && (changes.trackedWebsite || changes.trackedWebsiteUrl)) {
          syncSavedWebsite();
        }
      });
    }
  }

  window.websiteSelector = {
    init: initWebsiteSelector
  };
})();
