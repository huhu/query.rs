import searchIndex from 'querylib/index/std-docs.js';
import { DescShardManager, DocSearch } from 'querylib/search/index.js';

const stdSearcher = new DocSearch(
    "std",
    structuredClone(searchIndex),
    "https://doc.rust-lang.org/",
    new DescShardManager(),
);

/**
 * This function behaves as a suggestion provider for the search queries.
 * 
 * This will return results in the format of a keyword followed by a colon and a completion.
 * Format of the response is OpenSearch Suggestions 1.1.
 * https://github.com/dewitt/opensearch/blob/master/mediawiki/Specifications/OpenSearch/Extensions/Suggestions/1.1/Draft%201.wiki
 */
export async function GET({ params }) {
    let query = params.query;

    let result = [];
    result.push(query);

    /**
     * @type {string[]}
     */
    let completions = [];
    /**
     * @type {string[]}
     * */
    let desc = [];
    /**
     * @type {string[]}
     * */
    let urls = [];

    await stdSearch(query, completions, desc, urls, 8);
    // await crateSearch(query, completions, desc, urls, 3);

    result.push(completions);
    result.push(desc);
    result.push(urls);

    let res = Response.json(result);
    res.headers.set("Content-Type", "application/x-suggestions+json");
    res.headers.set("Cache-Control", "public, max-age=3600");
    return res;
}

/**
 * Search for a standard library item.
 * @param {string} query 
 * @param {string[]} completions 
 * @param {string[]} desc 
 * @param {string[]} urls 
 * @param {number} maxCount 
 */
async function stdSearch(query, completions, desc, urls, maxCount) {
    let response = await stdSearcher.search(query);
    let count = 0;
    for (const entry of response) {
        if (maxCount && count >= maxCount) {
            break;
        } else {
            count += 1;
        }

        // Suggest format like this: <doc> - <url>
        // The /redirect api will redirect the user to the url.
        completions.push(`${entry["path"]}::${entry["name"]} - ${entry["href"]}`);
        // Due to no browser support descript and url in suggestions,
        // we simply set it to empty right now.
        desc.push("");
        urls.push("");
    }
}

// /**
//  * Search for a crate.
//  * @param {string} query 
//  * @param {string[]} completions 
//  * @param {string[]} desc 
//  * @param {string[]} urls 
//  * @param {number} maxCount 
//  */
// async function crateSearch(query, completions, desc, urls, maxCount) {
//     const crateSearcher = new CrateSearch(await IndexManager.getCrateMapping(), await IndexManager.getCrateIndex());
//     let response = crateSearcher.search(query);

//     let count = 0;
//     for (const entry of response) {
//         if (maxCount && count >= maxCount) {
//             break;
//         } else {
//             count += 1;
//         }

//         let entryDisplay = "crate: " + entry["id"];
//         entryDisplay = entryDisplay //+ " - " + "https://docs.rs/" + entry["id"];
//         completions.push(entryDisplay);
//         desc.push(entry["description"]);
//         urls.push("https://docs.rs/" + entry["id"]);
//     }
// }
