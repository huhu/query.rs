import { HeadlessOmnibox, Compat } from "omnibox-js";
import DescShardManager from "../../lib/search/docs/desc-shard.js";
import DocSearch from "../../lib/search/docs/base.js";
import searchIndex from "../../lib/index/std-docs.js";
import stdDescShards from "../../lib/index/desc-shards/std.js";
import { searchCrates } from "./crates.ts";
import { suggest } from "./suggest.js";

export async function initHeadlessOmnibox() {
  let crateSearchCache = null;
  const headless = new HeadlessOmnibox({
    onSearch: async (query) => {
      let suggestions = await suggest(query);
      let results = suggestions.map((item) => {
        return { content: item.url, description: item.name };
      });
      return results;
    },
    onAppend: async (query) => {
      return [
        {
          content: `https://query.rs/?q=${query}`,
          description: `Search keyword ${query} on https://query.rs`,
        },
      ];
    },
  });

  /**
   * Search crates on crates.io directly
   * @param {string} query
   */
  async function onSearchCrates(query) {
    let results = [];
    let keyword = query.replace(/[!\s]/g, "");
    if (crateSearchCache && crateSearchCache.keyword === keyword) {
      return crateSearchCache.results;
    }
    let crates = await searchCrates(keyword);
    for (const crate of crates) {
      results.push({
        id: crate.id,
        version: crate.max_stable_version,
        description: crate.description,
      });
    }
    crateSearchCache = { keyword, results };
    return results;
  }

  headless.addPrefixQueryEvent("!", {
    name: "docs.rs",
    onSearch: onSearchCrates,
    onFormat: (index, crate) => {
      return {
        content: `https://docs.rs/${crate.id}`,
        description: `Docs.rs: <match>${crate.id}</match> v${crate.version} - <dim>${Compat.escape(Compat.eliminateTags(crate.description))}</dim>`,
      };
    },
    onAppend: (query) => {
      let keyword = query.replace(/[!\s]/g, "");
      return [
        {
          content: "https://docs.rs/releases/search?query=" + encodeURIComponent(keyword),
          description: "Search Rust crates for " + `<match>${keyword}</match>` + " on https://docs.rs",
        },
      ];
    },
  });

  headless.addPrefixQueryEvent("!!", {
    name: "crates.io",
    onSearch: onSearchCrates,
    onFormat: async (index, crate) => {
      return {
        content: `https://crates.io/crates/${crate.id}`,
        description: `Crates.io: ${crate.id} v${crate.version} - <dim>${Compat.escape(Compat.eliminateTags(crate.description))}</dim>`,
      };
    },
    onAppend: async (query) => {
      let keyword = query.replace(/[!\s]/g, "");
      return [
        {
          content: `https://crates.io/search?q=` + encodeURIComponent(keyword),
          description: "Search Rust crates for " + `<match>${keyword}</match>` + ` on https://crates.io`,
        },
      ];
    },
  });

  headless.addPrefixQueryEvent("!!!", {
    name: "Repository",
    onSearch: onSearchCrates,
    onFormat: (index, crate) => {
      return {
        content: `https://query.rs/repo/${crate.id}`,
        description: `Repository: <match>${crate.id}</match> v${crate.version} - <dim>${Compat.escape(Compat.eliminateTags(crate.description))}</dim>`,
      };
    },
    onAppend: (query) => {
      let keyword = query.replace(/[!\s]/g, "");
      return [
        {
          content: "https://github.com/search?q=" + encodeURIComponent(keyword),
          description: "Search Rust crates for " + `<match>${keyword}</match>` + " on https://github.com",
        },
      ];
    },
  });
  headless.addRegexQueryEvent(/^`?e\d{2,4}`?$/i, {
    name: "Error code",
    onSearch: async (query) => {
      query = query.replace("`", "");
      let baseIndex = parseInt(query.slice(1).padEnd(4, "0"));
      let result = [];
      for (let i = 0; i < 10; i++) {
        let errorIndex = "E" + String(baseIndex++).padStart(4, "0").toUpperCase();
        result.push(errorIndex);
      }

      return result.map((errorCode) => {
        return {
          content: `https://doc.rust-lang.org/error_codes/${errorCode}.html`,
          description: `Open error code <match>${errorCode}</match> on error codes index`,
        };
      });
    },
  });
  return headless;
}
