import DocSearch from "./base.js";
import CrateDocManager from "../../crate-manager.js";
import settings from "../../settings.js";
import DescShardManager from "./desc-shard.js";
import IndexManager from "../../index-manager.js";

// Search all crate's docs, including `@` sigil and `~` sigil,.
export default class CrateDocSearch {
    constructor() {
        this.cachedCrateSearcher = null;
        this.allCrateSearcher = null;
    }

    async initAllCrateSearcher() {
        let searchIndex = new Map();
        let descShards = new DescShardManager();
        for (const libName of Object.keys(await CrateDocManager.getCrates())) {
            let crateSearchIndex = await CrateDocManager.getCrateSearchIndex(libName);
            if (crateSearchIndex) {
                // merge search index into single map
                searchIndex = new Map([...searchIndex, ...crateSearchIndex]);
            }
            descShards.addCrateDescShards(await IndexManager.getDescShards(libName));
        }
        this.allCrateSearcher = new DocSearch("~", searchIndex, "https://docs.rs/~/*/", descShards);
    }

    // Search specific crate docs by prefix `@` sigil.
    // If that crate not been indexed, fallback to the list of all indexed crates.
    async search(query) {
        let [libName, keyword] = CrateDocSearch.parseCrateDocsSearchKeyword(query);

        let searcher = null;
        if (this.cachedCrateSearcher?.name === libName) {
            searcher = this.cachedCrateSearcher;
            searcher.version = await settings.keepCratesUpToDate ? "latest" : searcher.version;
        } else {
            let crate = await CrateDocManager.getCrateByName(libName);
            if (crate) {
                let searchIndex = await CrateDocManager.getCrateSearchIndex(libName);
                const crateVersion = await settings.keepCratesUpToDate ? "latest" : crate.version;
                searcher = new DocSearch(
                    libName,
                    searchIndex,
                    `https://docs.rs/${libName}/${crateVersion}/`,
                    await DescShardManager.create(await IndexManager.getDescShards(libName)),
                );

                this.cachedCrateSearcher = searcher;
            } else {
                let crates = await CrateDocManager.getCrates();
                let list = Object.entries(crates).map(([libName, crate]) => {
                    crate["name"] = libName;
                    return crate;
                });

                list = list.filter(item => !libName || item.name.toLowerCase().indexOf(libName) > -1)
                    .sort((a, b) => a.name.localeCompare(b.name));
                if (list.length > 0) {
                    list.unshift({
                        content: libName, // Non-empty value is required for content, so maybe give it a crate name.
                        description: `Following ${list.length} crate(s) were indexed by you, select one to search their docs exclusively.`
                    });
                } else {
                    list.unshift({
                        content: `https://docs.rs/${libName}/latest/?search=${encodeURIComponent(keyword)}`,
                        description: `Crate <match>${libName}</match> has not been indexed, search ${keyword ? `<match>${keyword}</match>` : 'keyword'} on <dim>${`https://docs.rs/${libName}`}</dim> directly`,
                    });
                }
                return list;
            }
        }

        let results = await searcher.search(keyword);
        // Push result footer.
        results.push({
            content: await searcher.getSearchUrl(keyword),
            description: `Search ${keyword ? `<match>${keyword}</match>` : 'keyword'} on <dim>${`https://docs.rs/${libName}`}</dim> directly`,
        });
        return results;
    }

    // Search all saved crates docs collectively.
    async searchAll(query) {
        if (!this.allCrateSearcher) {
            await this.initAllCrateSearcher();
        }
        let keyword = query.replaceAll("~", "").trim();
        return await this.allCrateSearcher.search(keyword);
    }

    // Invalidate cached search. This is needed if we update crate's search index.
    invalidateCachedSearch() {
        this.cachedCrateSearcher = null;
    }

    static parseCrateDocsSearchKeyword(query) {
        query = query.replaceAll("@", "").trim();
        let [crateName, ...keyword] = query.split(/\s/i);
        return [crateName, keyword.filter(k => k).join('')];
    }
}
