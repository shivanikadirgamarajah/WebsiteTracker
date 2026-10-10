(function () {

  function formatDurationLabel(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  }

  function renderTarget(targetHours, trackedSeconds = 0) {
    const targetCard = document.getElementById("target-card");
    const targetEmptyState = document.getElementById("target-empty-state");
    const targetHoursValue = document.getElementById("target-hours-value");
    const targetProgressLabel = document.getElementById("target-progress-label");
    const progressFill = document.querySelector(".progress-fill");

    if (
      !targetCard ||
      !targetEmptyState ||
      !targetHoursValue ||
      !targetProgressLabel
    ) {
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

    const seconds = Math.max(0, Number(trackedSeconds) || 0);
    const targetSeconds = hours * 3600;
    const percent = Math.min((seconds / targetSeconds) * 100, 100);

    targetHoursValue.textContent =
      `${hours} hour${hours === 1 ? "" : "s"}`;

    targetProgressLabel.textContent =
      `${formatDurationLabel(seconds)} / ${hours} hrs`;

    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }
  }

  function initTargetSection() {

    const setTargetButton =
      document.getElementById("set-target-button");

    const editTargetButton =
      document.getElementById("edit-target-button");

    const targetModal =
      document.getElementById("target-modal");

    const prevTargetButton =
      document.getElementById("target-carousel-prev");

    const nextTargetButton =
      document.getElementById("target-carousel-next");

    const slideTitle =
      document.getElementById("target-slide-title");

    const slideText =
      document.getElementById("target-slide-text");

    const targetInputSlide =
      document.getElementById("target-input-slide");

    const targetHoursInput =
      document.getElementById("target-hours-input");

    const targetResultCard =
      document.getElementById("target-result-card");

    const targetResultInitial =
      document.getElementById("target-result-initial");

    const targetResultSolid =
      document.getElementById("target-result-solid");

    const targetResultWorld =
      document.getElementById("target-result-world");

    const targetResultCopy =
      document.getElementById("target-result-copy");

    const cancelTargetButton =
      document.getElementById("cancel-target-button");

    const confirmTargetButton =
      document.getElementById("confirm-target-button");

    if (
      !setTargetButton ||
      !editTargetButton ||
      !targetModal ||
      !prevTargetButton ||
      !nextTargetButton ||
      !slideTitle ||
      !slideText ||
      !targetInputSlide ||
      !targetHoursInput ||
      !targetResultCard ||
      !targetResultInitial ||
      !targetResultSolid ||
      !targetResultWorld ||
      !cancelTargetButton ||
      !confirmTargetButton
    ) {
      return;
    }

    const slides = [
      {
        title: "20 Hours - Initial Proficiency",
        text: "20 hours of focused, active practice can take you from a complete beginner to a basic, working level of competence in many skills.",
        isTargetSlide: false
      },
      {
        title: "1,000 Hours - Solid Competence",
        text: "Reaching a high, skilled level (roughly a 7 out of 10) in most activities typically requires around 1,000 hours of deliberate practice.",
        isTargetSlide: false
      },
      {
        title: "10,000 Hours - World-Class Mastery",
        text: "Roughly 10,000 hours of deliberate practice separates elite, world-class performers from everyone else.",
        isTargetSlide: false
      },
      {
        title: "Choose your weekly target",
        text: "Pick the number of hours you want to reach each week.",
        isTargetSlide: true
      }
    ];

    let currentSlide = 0;

    function formatWeeksOrMonths(weeks) {
      if (weeks >= 52) {
        const years = Math.max(1, Math.round(weeks / 52));
        return `${years} year${years === 1 ? "" : "s"}`;
      }

      if (weeks > 4) {
        const months = Math.max(1, Math.round(weeks / 4.333));
        return `${months} month${months === 1 ? "" : "s"}`;
      }

      return `${weeks} week${weeks === 1 ? "" : "s"}`;
    }

    function updateTargetResult() {
      const selectedHours = Number(targetHoursInput.value);
      const milestones = [
        { label: "Initial proficiency", hours: 20, element: targetResultInitial },
        { label: "Solid competence", hours: 1000, element: targetResultSolid },
        { label: "World-class mastery", hours: 10000, element: targetResultWorld }
      ];

      milestones.forEach((milestone) => {
        const weeks = Math.max(1, Math.ceil(milestone.hours / selectedHours));
        milestone.element.textContent = formatWeeksOrMonths(weeks);
      });

      targetInputSlide.classList.add("is-selected");
      targetResultCard.classList.remove("hidden");
    }

    function updateCarousel() {
      const activeSlide = slides[currentSlide];
      const isTargetSlide = activeSlide.isTargetSlide;

      slideTitle.textContent = activeSlide.title;
      slideText.textContent = activeSlide.text;
      targetInputSlide.classList.toggle("hidden", !isTargetSlide);

      if (isTargetSlide) {
        slideText.textContent = "Pick the number of hours you want to reach each week.";
        targetInputSlide.classList.remove("is-selected");
        targetResultCard.classList.add("hidden");
      }
    }

    function openModal(goToTargetSlide = false) {
      targetModal.classList.remove("hidden");

      currentSlide = goToTargetSlide ? slides.length - 1 : 0;
      updateCarousel();
    }

    function closeModal() {
      targetModal.classList.add("hidden");
    }

    prevTargetButton.addEventListener("click", () => {
      currentSlide =
        (currentSlide - 1 + slides.length) %
        slides.length;

      updateCarousel();
    });

    nextTargetButton.addEventListener("click", () => {
      currentSlide =
        (currentSlide + 1) %
        slides.length;

      updateCarousel();
    });

    targetHoursInput.addEventListener("change", () => {
      updateTargetResult();
    });

    setTargetButton.addEventListener(
      "click",
      () => openModal(false)
    );

    editTargetButton.addEventListener(
      "click",
      () => openModal(true)
    );

    cancelTargetButton.addEventListener(
      "click",
      closeModal
    );

    confirmTargetButton.addEventListener(
      "click",
      async () => {

        const hours =
          Number(targetHoursInput.value);

        await window.BrainFmStorage.set({
          weeklyTargetHours: hours
        });

        renderTarget(hours);

        closeModal();
      }
    );

    async function syncTargetHours() {
      const result = await window.BrainFmStorage.get([
        "weeklyTargetHours",
        "weeklyProgressSeconds",
        "weeklyProgressWeekStart"
      ]);

      const savedHours = Number(result.weeklyTargetHours);
      const progressSeconds = Number(result.weeklyProgressSeconds) || 0;
      const weekStart = result.weeklyProgressWeekStart;
      const currentWeekKey = new Date();
      const day = currentWeekKey.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      currentWeekKey.setHours(0, 0, 0, 0);
      currentWeekKey.setDate(currentWeekKey.getDate() + mondayOffset);
      const expectedWeekKey = currentWeekKey.toISOString().slice(0, 10);

      if (weekStart !== expectedWeekKey && Number.isFinite(savedHours) && savedHours > 0) {
        await window.BrainFmStorage.set({
          weeklyProgressSeconds: 0,
          weeklyProgressWeekStart: expectedWeekKey
        });
      }

      if (Number.isFinite(savedHours) && savedHours > 0) {
        targetHoursInput.value = String(savedHours);
      }

      const weeklySeconds = Number((await window.BrainFmStorage.get(["weeklyProgressSeconds"])).weeklyProgressSeconds) || 0;

      updateTargetResult();
      renderTarget(savedHours || 0, weeklySeconds);
    }

    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && (changes.weeklyTargetHours || changes.weeklyProgressSeconds || changes.weeklyProgressWeekStart)) {
          syncTargetHours();
        }
      });
    }

    syncTargetHours();

    updateCarousel();
  }

  window.targetSection = {
    init: initTargetSection
  };

})();