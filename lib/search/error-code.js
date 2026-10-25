import { Compat } from "omnibox-js";
import errorCodesIndex from "../index/error-codes.js";

/**
 * Published Rust compiler error codes, keyed by code (E0038).
 * Values are short summaries taken from the official error index.
 */
export { errorCodesIndex };

/**
 * Filter the published error-code index by the typed code prefix.
 * `e038` matches E0380, E0382, … while `e0382` matches only E0382.
 * Codes that were never published, or were removed, are absent from the index.
 *
 * @param {string} query
 * @returns {{ code: string, description: string }[]}
 */
export function searchErrorCodes(query) {
    const prefix = String(query).replace(/`/g, "").trim().toUpperCase();
    if (!/^E\d{2,4}$/.test(prefix)) {
        return [];
    }

    const matches = [];
    for (const code of Object.keys(errorCodesIndex)) {
        if (code.startsWith(prefix)) {
            matches.push({
                code,
                description: errorCodesIndex[code],
            });
        }
    }
    return matches;
}

/**
 * @param {string} baseUrl Docs root, including a trailing slash. Offline mode passes `settings.offlineDocPath`.
 * @param {{ code: string, description: string }} entry
 */
export function formatErrorCode(baseUrl, entry) {
    let description = `Open error code <match>${entry.code}</match> on error codes index`;
    if (entry.description) {
        description += ` - <dim>${Compat.escape(entry.description)}</dim>`;
    }
    return {
        content: `${baseUrl}error_codes/${entry.code}.html`,
        description,
    };
}
