(function () {
  function renderTarget(targetHours) {
    const targetCard = document.getElementById("target-card");
    const targetEmptyState = document.getElementById("target-empty-state");
    const targetHoursValue = document.getElementById("target-hours-value");
    const targetProgressLabel = document.getElementById("target-progress-label");

    if (!targetCard || !targetEmptyState || !targetHoursValue || !targetProgressLabel) {
      return;
    }

    const hours = Number(targetHours);

    if (!Number.isFinite(hours) || hours <= 0) {
      targetCard.classList.add("hidden");
      targetEmptyState.classList.remove("hidden");
      return;
    }

    targetCard.classList.remove("hidden");
    targetEmptyState.classList.add("hidden");

    targetHoursValue.textContent = `${hours} hour${hours === 1 ? "" : "s"}`;
    targetProgressLabel.textContent = `0 / ${hours} hrs`;
  }

  function initTargetSection() {
    const targetCard = document.getElementById("target-card");
    const targetEmptyState = document.getElementById("target-empty-state");
    const setTargetButton = document.getElementById("set-target-button");
    const targetModal = document.getElementById("target-modal");
    const targetModalInput = document.getElementById("target-modal-input");
    const cancelTargetButton = document.getElementById("cancel-target-button");
    const confirmTargetButton = document.getElementById("confirm-target-button");

    if (!targetCard || !targetEmptyState || !setTargetButton || !targetModal || !targetModalInput || !cancelTargetButton || !confirmTargetButton) {
      return;
    }

    const openModal = () => {
      targetModal.classList.remove("hidden");
      targetModalInput.value = "";
      targetModalInput.focus();
    };

    const closeModal = () => {
      targetModal.classList.add("hidden");
    };

    const syncTargetHours = async () => {
      const result = await window.BrainFmStorage.get(["weeklyTargetHours"]);
      renderTarget(result.weeklyTargetHours);
    };

    setTargetButton.addEventListener("click", openModal);
    cancelTargetButton.addEventListener("click", closeModal);

    targetModalInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        confirmTargetButton.click();
      }

      if (event.key === "Escape") {
        closeModal();
      }
    });

    confirmTargetButton.addEventListener("click", async () => {
      const hours = Number(targetModalInput.value);

      if (!Number.isFinite(hours) || hours <= 0) {
        targetModalInput.focus();
        return;
      }

      await window.BrainFmStorage.set({ weeklyTargetHours: hours });
      renderTarget(hours);
      closeModal();
    });

    syncTargetHours();

    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && changes.weeklyTargetHours) {
          renderTarget(changes.weeklyTargetHours.newValue);
        }
      });
    }
  }

  window.targetSection = {
    init: initTargetSection
  };
})();
