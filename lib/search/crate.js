import Deminifier from "../deminifier.js";
import { levenshtein } from "./algorithm.js";

// Prototype function to perform levenshtein contain search.
String.prototype.levenshteinContains = function (/** @type {string | String | any[]} */ keyword) {
    let len = keyword.length;
    if (this === keyword) return true;

    for (let i = 0; i <= this.length - len; i++) {
        if (levenshtein(this.substring(i, len), keyword) <= 1) {
            return true;
        }
    }
    return false;
};

export default class CrateSearch {
    /**
     * @param {any} mapping
     * @param {any} crateIndex
     */
    constructor(mapping, crateIndex) {
        this.setMapping(mapping);
        this.setCrateIndex(crateIndex);
    }

    /**
     * @param {any} mapping
     */
    setMapping(mapping) {
        /**
         * @type {Deminifier}
         */
        this.deminifier = new Deminifier(mapping);
    }

    /**
     * @param {ArrayLike<any> | { [s: string]: any; }} crateIndex
     */
    setCrateIndex(crateIndex) {
        this.crateIndex = Object.create(null);
        for (let [key, value] of Object.entries(crateIndex)) {
            this.crateIndex[this.deminifier.deminify(key)] = value;
        }
        this.crateIds = Object.keys(this.crateIndex);
    }

    /**
     * Perform prefix levenshtein search.
     * @param {string} keyword the keyword to search against.
     */
    search(keyword) {
        let result = [];
        keyword = keyword.replace(/[!\s]/g, "");
        let keyword2 = keyword.replace(/[-_]/g, "");
        for (let rawCrateId of this.crateIds) {
            let crateId = rawCrateId.replace(/[\s]/ig, "");
            if (crateId.length < keyword.length) continue;

            let crateId2 = crateId.replace(/[-_]/g, "");

            if (crateId.startsWith(keyword) || crateId2.startsWith(keyword2)) {
                result.push({
                    id: rawCrateId,
                    matchIndex: 0,
                });
            } else if (crateId.indexOf(keyword) !== -1) {
                result.push({
                    id: rawCrateId,
                    matchIndex: crateId.indexOf(keyword) !== -1,
                });
            } else if (keyword.length >= 4 && crateId.levenshteinContains(keyword)) {
                result.push({
                    id: rawCrateId,
                    matchIndex: 999, // Levenshtein contain result always has highest matchIndex.
                });
            }
        }
        // Sort the result, the lower matchIndex, the shorter length, the higher rank.
        return result.sort((a, b) => {
            if (a.matchIndex === b.matchIndex) {
                return a.id.length - b.id.length;
            }
            return a.matchIndex - b.matchIndex;
        }).map(item => {
            let [description, version] = this.crateIndex[item.id];
            return {
                id: item.id,
                description: this.deminifier.deminify(description),
                version,
            }
        });
    }
};
