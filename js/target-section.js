(function () {

  function renderTarget(targetHours) {
    const targetCard = document.getElementById("target-card");
    const targetEmptyState = document.getElementById("target-empty-state");
    const targetHoursValue = document.getElementById("target-hours-value");
    const targetProgressLabel = document.getElementById("target-progress-label");

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

    targetHoursValue.textContent =
      `${hours} hour${hours === 1 ? "" : "s"}`;

    targetProgressLabel.textContent =
      `0 / ${hours} hrs`;
  }

  function initTargetSection() {

    const setTargetButton =
      document.getElementById("set-target-button");

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

    const cancelTargetButton =
      document.getElementById("cancel-target-button");

    const confirmTargetButton =
      document.getElementById("confirm-target-button");

    if (
      !setTargetButton ||
      !targetModal ||
      !prevTargetButton ||
      !nextTargetButton ||
      !slideTitle ||
      !slideText ||
      !targetInputSlide ||
      !targetHoursInput ||
      !cancelTargetButton ||
      !confirmTargetButton
    ) {
      return;
    }

    const slides = [
      {
        title: "Set a weekly goal",
        text: "Choose how many hours you want to spend on this website each week.",
        isTargetSlide: false
      },
      {
        title: "Track your progress",
        text: "Your dashboard will show how much time you've completed compared with your weekly target.",
        isTargetSlide: false
      },
      {
        title: "Build a consistent habit",
        text: "A weekly goal can help you stay consistent without needing to track your time manually.",
        isTargetSlide: false
      },
      {
        title: "Choose your weekly target",
        text: "Pick the number of hours you want to reach each week.",
        isTargetSlide: true
      }
    ];

    let currentSlide = 0;

    function updateCarousel() {
      const activeSlide = slides[currentSlide];
      const isTargetSlide = activeSlide.isTargetSlide;

      slideTitle.textContent = activeSlide.title;
      slideText.textContent = activeSlide.text;
      targetInputSlide.classList.toggle("hidden", !isTargetSlide);

      if (isTargetSlide) {
        slideText.textContent = "Pick the number of hours you want to reach each week.";
      }
    }

    function openModal() {
      targetModal.classList.remove("hidden");

      currentSlide = 0;
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

    setTargetButton.addEventListener(
      "click",
      openModal
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

      const result =
        await window.BrainFmStorage.get([
          "weeklyTargetHours"
        ]);

      const savedHours =
        Number(result.weeklyTargetHours);

      if (
        Number.isFinite(savedHours) &&
        savedHours > 0
      ) {
        targetHoursInput.value =
          String(savedHours);
      }

      renderTarget(
        result.weeklyTargetHours
      );
    }

    syncTargetHours();

    updateCarousel();
  }

  window.targetSection = {
    init: initTargetSection
  };

})();