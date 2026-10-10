const componentFiles = {
  "website-selector-root": "components/website-selector.html",
  "target-section-root": "components/target-section.html"
};

function loadComponent(containerId, filePath) {
  const container = document.getElementById(containerId);
  if (!container) {
    return Promise.resolve();
  }

  return fetch(filePath)
    .then((response) => response.text())
    .then((html) => {
      container.innerHTML = html;
    })
    .catch(() => {
      container.innerHTML = "";
    });
}

async function initPage() {
  await Promise.all([
    loadComponent("website-selector-root", componentFiles["website-selector-root"]),
    loadComponent("target-section-root", componentFiles["target-section-root"])
  ]);

  if (typeof window.websiteSelector?.init === "function") {
    window.websiteSelector.init();
  }

  if (typeof window.targetSection?.init === "function") {
    window.targetSection.init();
  }
}

initPage();
