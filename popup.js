document.addEventListener("DOMContentLoaded", () => {
    const onLoad = document.getElementById("onLoad");
    const onUnload = document.getElementById("onUnload");
    const onRouteChange = document.getElementById("onRouteChange");

    chrome.storage.local.get(
        ["onLoad", "onUnload", "onRouteChange"],
        (prefs) => {
            if (!prefs) {
                console.warn(
                    "chrome.storage.local.get returned undefined prefs!"
                );
                prefs = {};
            }

            onLoad.checked = prefs.onLoad !== undefined ? prefs.onLoad : true;
            onUnload.checked =
                prefs.onUnload !== undefined ? prefs.onUnload : true;
            onRouteChange.checked =
                prefs.onRouteChange !== undefined ? prefs.onRouteChange : true;
        }
    );

    document.getElementById("save").addEventListener("click", () => {
        chrome.storage.local.set(
            {
                onLoad: onLoad.checked,
                onUnload: onUnload.checked,
                onRouteChange: onRouteChange.checked,
            },
            () => {
                console.log("Preferences saved:", {
                    onLoad: onLoad.checked,
                    onUnload: onUnload.checked,
                    onRouteChange: onRouteChange.checked,
                });
                window.close();
            }
        );
    });
});
