import { IndexManager } from 'querylib';
import { CrateSearch, DescShardManager, DocSearch } from 'querylib/search/index.js';

/**
 * This function behaves as a suggestion provider for the search queries.
 * 
 * This will return results in the format of a keyword followed by a colon and a completion.
 * Format of the response is OpenSearch Suggestions 1.1.
 * https://github.com/dewitt/opensearch/blob/master/mediawiki/Specifications/OpenSearch/Extensions/Suggestions/1.1/Draft%201.wiki
 */
export async function GET({params, platform}) {
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
    
    await stdSearch(query, completions, desc, urls, 4);
    await crateSearch(query, completions, desc, urls, 3);

    result.push(completions);
    result.push(desc);
    result.push(urls);

    let res = Response.json(result);
    res.headers.set("Content-Type", "application/x-suggestions+json")
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
    const stdDescShards = await DescShardManager.create("std-stable");
    let stdSearcher = new DocSearch(
        "std",
        await IndexManager.getStdStableIndex(),
        "https://doc.rust-lang.org/",
        stdDescShards,
    );

    let response = await stdSearcher.search(query);

    let count = 0;
    for (const entry of response) {
        if (maxCount && count >= maxCount) {
            break;
        } else {
            count += 1;
        }

        let entryDisplay = "std: " + entry["path"] + "::" + entry["name"];
        entryDisplay = entryDisplay //+ " - " + entry["href"];
        completions.push(entryDisplay);
        desc.push(entry["desc"]);
        urls.push(entry["href"]);
    }
}

/**
 * Search for a crate.
 * @param {string} query 
 * @param {string[]} completions 
 * @param {string[]} desc 
 * @param {string[]} urls 
 * @param {number} maxCount 
 */
async function crateSearch(query, completions, desc, urls, maxCount) {
    const crateSearcher = new CrateSearch(await IndexManager.getCrateMapping(), await IndexManager.getCrateIndex());
    let response = crateSearcher.search(query);

    let count = 0;
    for (const entry of response) {
        if (maxCount && count >= maxCount) {
            break;
        } else {
            count += 1;
        }

        let entryDisplay = "crate: " + entry["id"];
        entryDisplay = entryDisplay //+ " - " + "https://docs.rs/" + entry["id"];
        completions.push(entryDisplay);
        desc.push(entry["description"]);
        urls.push("https://docs.rs/" + entry["id"]);
    }
}