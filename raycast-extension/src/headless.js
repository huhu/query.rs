import { HeadlessOmnibox } from "omnibox-js";
import DescShardManager from "../../lib/search/docs/desc-shard.js";
import DocSearch from "../../lib/search/docs/base.js";
import searchIndex from "../../lib/index/std-docs.js";
import stdDescShards from "../../lib/index/desc-shards/std.js";

export async function initHeadlessOmnibox() {
    let stdSearcher = new DocSearch(
        "std",
        searchIndex,
        "https://doc.rust-lang.org/",
        await DescShardManager.create(stdDescShards),
    );
    const headless = new HeadlessOmnibox({
        onSearch: async (query) => {
            return await stdSearcher.search(query);
        },
        onFormat: (index, doc) => {
            let content = doc.href;
            let description = doc.displayPath + `${doc.name}`;
            if (doc.desc) {
                description += ` - ${doc.desc}`;
            }

            return { content, description };
        },
        onAppend: async (query) => {
            return [{
                content: `https://query.rs/?q=${query}`,
                description: `Search Rust docs ${query} on https://query.rs`,
            }];
        },
    });
    return headless;
}