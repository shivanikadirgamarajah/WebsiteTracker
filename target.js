const targetCard = document.getElementById("target-card");
const targetEmptyState = document.getElementById("target-empty-state");
const targetForm = document.getElementById("target-form");
const targetHoursTitle = document.getElementById("target-hours-title");
const targetProgressLabel = document.getElementById("target-progress-label");
const targetHoursInput = document.getElementById("target-hours-input");
const setTargetButton = document.getElementById("set-target-button");

const storage = {
  get(key, callback) {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([key], (result) => callback(result[key]));
      return;
    }

    try {
      const value = localStorage.getItem(key);
      callback(value === null ? undefined : JSON.parse(value));
    } catch {
      callback(undefined);
    }
  },

  set(obj, callback) {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(obj, callback);
      return;
    }

    try {
      Object.entries(obj).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
      if (typeof callback === "function") {
        callback();
      }
    } catch {
      if (typeof callback === "function") {
        callback();
      }
    }
  }
};

function renderTarget(targetHours) {
  const hours = Number(targetHours);

  if (!Number.isFinite(hours) || hours <= 0) {
    targetCard.classList.add("hidden");
    targetEmptyState.classList.remove("hidden");
    targetForm.classList.add("hidden");
    return;
  }

  targetCard.classList.remove("hidden");
  targetEmptyState.classList.add("hidden");
  targetForm.classList.add("hidden");

  targetHoursTitle.textContent = `${hours} hour${hours === 1 ? "" : "s"}`;
  targetProgressLabel.textContent = `0 / ${hours} hrs`;
}

setTargetButton.addEventListener("click", () => {
  targetEmptyState.classList.add("hidden");
  targetForm.classList.remove("hidden");
  targetHoursInput.focus();
});

targetForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const hours = Number(targetHoursInput.value);

  if (!Number.isFinite(hours) || hours <= 0) {
    targetHoursInput.focus();
    return;
  }

  storage.set({ weeklyTargetHours: hours }, () => {
    renderTarget(hours);
  });
});

storage.get("weeklyTargetHours", (value) => {
  renderTarget(value);
});
