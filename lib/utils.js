// 6 week release gap.
const RUST_RELEASE_GAP = 6 * 7;

function getScheduledVersions(limit = 10) {
    let versions = [];
    let startMinor = 42;
    let date = new Date("2020-03-12");
    let today = new Date();
    // Set to the start seconds of today
    today.setHours(0, 0, 0);
    for (let i = 1, j = 1; j <= limit; i++) {
        date.setDate(date.getDate() + RUST_RELEASE_GAP);
        if (date >= today) {
            let minor = startMinor + i;
            versions.push({
                number: "1." + minor + ".0",
                major: 1,
                minor,
                fix: 0,
                date: new Date(date),
            });
            j += 1;
        }
    }
    return versions;
}

function getReleasedVersions() {
    let versions = [];
    let nextVersion = getScheduledVersions(1)[0];
    let startMinor = nextVersion.minor;
    let date = nextVersion.date;
    let now = new Date();
    for (let i = startMinor, j = 1; i > 1; i--) {
        date.setDate(date.getDate() - RUST_RELEASE_GAP);
        if (date <= now) {
            let minor = startMinor - j;
            versions.push({
                number: "1." + minor + ".0",
                major: 1,
                minor,
                fix: 0,
                date: new Date(date),
            });
            j += 1;
        }
    }
    // Version 1.0.0 is a special release date.
    versions.push({
        number: "1.0.0",
        major: 1,
        minor: 0,
        fix: 0,
        date: new Date("2015-05-15"),
    });
    return versions;
}

// Debouncing cache and timeout for crate searches
const crateSearchCache = new Map();
const crateSearchTimeouts = new Map();
const DEBOUNCE_DELAY = 300; // 300ms debounce delay

/**
 * @param {string } query
 * @returns {Promise<{id: string, name:string, max_stable_version: string, description: string}[]>}
 */
async function searchCrates(query) {
    // Return cached result immediately if available
    if (crateSearchCache.has(query)) {
        return crateSearchCache.get(query);
    }
    
    // Clear any existing timeout for this query
    if (crateSearchTimeouts.has(query)) {
        clearTimeout(crateSearchTimeouts.get(query));
        crateSearchTimeouts.delete(query);
    }
    
    // Return a promise that resolves after debounce delay
    return new Promise((resolve) => {
        const timeoutId = setTimeout(async () => {
            try {
                const response = await fetch(`https://crates.io/api/v1/crates?q=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    const result = data.crates;
                    
                    // Cache the result for 5 minutes
                    crateSearchCache.set(query, result);
                    setTimeout(() => crateSearchCache.delete(query), 5 * 60 * 1000);
                    
                    resolve(result);
                } else {
                    resolve([]);
                }
            } catch (error) {
                console.warn('Crate search failed:', error);
                resolve([]);
            } finally {
                crateSearchTimeouts.delete(query);
            }
        }, DEBOUNCE_DELAY);
        
        crateSearchTimeouts.set(query, timeoutId);
    });
}

export { getScheduledVersions, searchCrates };