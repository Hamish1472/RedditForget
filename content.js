(function () {
    const keysToRemove = ["recent-searches-store", "recent-subreddits-store"];
    let lastUrl = location.href;

    function removeKeys() {
        keysToRemove.forEach((key) => {
            if (localStorage.getItem(key) !== null) {
                localStorage.removeItem(key);
                console.log(`Removed '${key}' from localStorage.`);
            }
        });
    }

    // State
    let prefs = {
        onLoad: true,
        onUnload: true,
        onRouteChange: true,
    };

    let observer = null;
    let unloadHandler = null;

    function setupUnloadListener(enable) {
        if (unloadHandler) {
            window.removeEventListener("beforeunload", unloadHandler);
            unloadHandler = null;
        }
        if (enable) {
            unloadHandler = () => removeKeys();
            window.addEventListener("beforeunload", unloadHandler);
        }
    }

    function setupRouteChangeListener(enable) {
        if (observer) {
            observer.disconnect();
            observer = null;
        }

        if (enable) {
            lastUrl = location.href; // <-- Resync when enabling observer
            observer = new MutationObserver(() => {
                const currentUrl = location.href;
                if (currentUrl !== lastUrl) {
                    lastUrl = currentUrl;
                    console.log("Route changed: clearing localStorage keys");
                    removeKeys();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    function applyPrefs() {
        if (prefs.onLoad) removeKeys();
        setupUnloadListener(prefs.onUnload);
        setupRouteChangeListener(prefs.onRouteChange);
    }

    // Initialize
    chrome.storage.local.get(
        ["onLoad", "onUnload", "onRouteChange"],
        (storedPrefs) => {
            prefs = {
                onLoad:
                    storedPrefs.onLoad !== undefined
                        ? storedPrefs.onLoad
                        : true,
                onUnload:
                    storedPrefs.onUnload !== undefined
                        ? storedPrefs.onUnload
                        : true,
                onRouteChange:
                    storedPrefs.onRouteChange !== undefined
                        ? storedPrefs.onRouteChange
                        : true,
            };
            applyPrefs();
        }
    );

    // Listen for prefs changes dynamically
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local") {
            let changed = false;
            if ("onLoad" in changes) {
                prefs.onLoad = changes.onLoad.newValue;
                if (prefs.onLoad) removeKeys();
            }
            if ("onUnload" in changes) {
                prefs.onUnload = changes.onUnload.newValue;
                changed = true;
            }
            if ("onRouteChange" in changes) {
                prefs.onRouteChange = changes.onRouteChange.newValue;
                changed = true;
            }
            if (changed) {
                // Update listeners without page reload
                setupUnloadListener(prefs.onUnload);
                setupRouteChangeListener(prefs.onRouteChange);
            }
        }
    });
})();
