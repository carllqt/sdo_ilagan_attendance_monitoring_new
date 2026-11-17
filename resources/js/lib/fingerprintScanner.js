/*
| One fingerprint scanner, several pages that use it (attendance,
| registration, the fingerprint test). The fingerprint service lets one
| browser tab use it at a time and tells the others who is using it.
|
| Every tab has its own id, made once when the app's JavaScript loads. It
| stays the same while moving between pages in the tab, and a reloaded or
| duplicated tab gets a new one.
*/
const clientId = `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;

// `claim: true` when a person opened the page or pressed a button: the
// scanner moves here. Automatic reconnects leave it out, so a forgotten tab
// cannot take the scanner from the page someone is using.
export const scannerUrl = (serviceUrl, path, params = {}) => {
    const query = new URLSearchParams();

    Object.entries({ ...params, client: clientId }).forEach(([key, value]) => {
        if (value === undefined || value === null || value === false) return;

        query.set(key, value === true ? "1" : String(value));
    });

    return `${serviceUrl}${path}?${query.toString()}`;
};

// { free, yours, owner: { mode, label, where, since, summary } | null }
export const fetchScannerStatus = async (serviceUrl) => {
    const response = await fetch(scannerUrl(serviceUrl, "/bioScannerStatus"), {
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`Scanner status failed: ${response.status}`);
    }

    return response.json();
};

// The page is closing: let another tab use the scanner right away.
export const releaseScanner = (serviceUrl) => {
    const url = scannerUrl(serviceUrl, "/bioScannerRelease");

    try {
        if (navigator.sendBeacon?.(url)) return;
    } catch {
        // fall through to fetch
    }

    fetch(url, { method: "POST", keepalive: true, mode: "no-cors" }).catch(
        () => {},
    );
};

// "taken": another page took the scanner from this connection.
// "busy": another page is using it, so this connection did not start.
export const scannerUsedElsewhere = (data) =>
    data?.status === "taken" || data?.status === "busy";

// "took_over": the scanner moved to this page from another one.
export const scannerMovedHere = (data) => data?.status === "took_over";
