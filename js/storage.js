(function () {
  const getStorage = () => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      return chrome.storage.local;
    }

    return null;
  };

  const storage = {
    async get(keys) {
      const localStorageApi = getStorage();

      if (localStorageApi) {
        return new Promise((resolve) => {
          localStorageApi.get(keys, (result) => {
            resolve(result || {});
          });
        });
      }

      const requested = Array.isArray(keys) ? keys : [keys];
      const values = {};

      requested.forEach((key) => {
        try {
          const raw = window.localStorage.getItem(key);
          values[key] = raw === null ? undefined : JSON.parse(raw);
        } catch {
          values[key] = undefined;
        }
      });

      return values;
    },

    async set(values) {
      const localStorageApi = getStorage();

      if (localStorageApi) {
        return new Promise((resolve) => {
          localStorageApi.set(values, () => resolve());
        });
      }

      Object.entries(values).forEach(([key, value]) => {
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
          // Ignore localStorage write failures when running outside an extension context.
        }
      });
    }
  };

  window.BrainFmStorage = storage;
})();
