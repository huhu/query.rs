import storage from "./storage.js";
import settings from "./settings.js";
import { Statistics, STATS_PATTERNS } from "./statistics.js";
import IndexManager from "./index-manager.js";
import IndexSetter from "./index-setter.js";
import CrateDocManager from "./crate-manager.js";
import DescShardManager from "./search/docs/desc-shard.js";
import { searchCrates } from "./utils.js";
import { Omnibox, HeadlessOmnibox, Compat, Render } from "omnibox-js";
import {
    CrateDocSearch,
    DocSearch,
    AttributeSearch,
    LintSearch,
    BookSearch,
    CaniuseSearch,
    CrateSearch,
} from "./search/index.js";
import {
    LabelCommand,
    RfcCommand,
    RustcCommand,
    TargetCommand,
    StableCommand,
    HelpCommand,
    SimpleCommand,
    OpenCommand,
    HistoryCommand,
    CommandManager
} from "./command/index.js";

export {
    STATS_PATTERNS,
    storage,
    settings,
    Compat,
    Render,
    Omnibox,
    Statistics,
    IndexSetter,
    IndexManager,
    CrateDocManager,
    DescShardManager,
}

async function getBaseUrl() {
    let isOfflineMode = await settings.isOfflineMode;
    return isOfflineMode ? await settings.offlineDocPath : 'https://doc.rust-lang.org/';
}

/**
 * Initializes and configures the headless search Omnibox.
 *
 * This function sets up various search providers, command handlers, and event handlers for the Omnibox interface.
 * It configures the search behavior, formatting, and appending for different types of queries, including:
 * - Standard Rust documentation search
 * - Nightly Rust documentation search
 * - Crate documentation search
 * - Attribute search
 * - Can I Use search
 * - Clippy lint search
 * - Command execution
 *
 * @returns {HeadlessOmnibox}
 */
async function initHeadlessOmnibox() {
    const crateSearcher = new CrateSearch(await IndexManager.getCrateMapping(), await IndexManager.getCrateIndex());
    let caniuseSearcher = new CaniuseSearch(await IndexManager.getCaniuseIndex());
    let bookSearcher = new BookSearch(await IndexManager.getBookIndex());
    let lintSearcher = new LintSearch(await IndexManager.getLintIndex());

    const attributeSearcher = new AttributeSearch();
    const crateDocSearcher = new CrateDocSearch();

    const commandIndex = await IndexManager.getCommandIndex();
    let labelCommand = new LabelCommand(await IndexManager.getLabelIndex());
    let rfcCommand = new RfcCommand(await IndexManager.getRfcIndex());
    let rustcCommand = new RustcCommand(await IndexManager.getRustcIndex());
    let targetCommand = new TargetCommand(await IndexManager.getTargetIndex());
    const cargoCommand = new SimpleCommand('cargo', 'Search useful third-party cargo subcommands.', commandIndex['cargo']);
    const bookCommand = new SimpleCommand('book', 'Search Rust books.', commandIndex['book']);
    const bookZhCommand = new SimpleCommand('book/zh', 'Search Chinese Rust books.', commandIndex['book/zh']);
    const yetCommand = new SimpleCommand('yet', 'Search Are We Yet websites.', commandIndex['yet']);
    const toolCommand = new SimpleCommand('tool', 'Show some most useful Rust tools.', commandIndex['tool']);
    const mirrorCommand = new SimpleCommand('mirror', 'Search Rust mirror websites.', commandIndex['mirror']);

    const commandManager = new CommandManager(
        cargoCommand,
        bookCommand,
        bookZhCommand,
        yetCommand,
        toolCommand,
        mirrorCommand,
        labelCommand,
        rfcCommand,
        rustcCommand,
        targetCommand,
        new HelpCommand(),
        new StableCommand(),
        new HistoryCommand(),
        new OpenCommand('release', 'Open rust-lang repository release page.',
            "https://doc.rust-lang.org/nightly/releases.html",
            {
                content: ':release',
                description: `Press <match>Enter</match> to open rust-lang repository release page.`,
            }),
    );

    const nightlyDescShards = await DescShardManager.create(await IndexManager.getDescShards("std-nightly"));
    const stdDescShards = await DescShardManager.create(await IndexManager.getDescShards("std-stable"));
    let nightlySearcher = new DocSearch(
        "std",
        await IndexManager.getStdNightlyIndex(),
        "https://doc.rust-lang.org/nightly/",
        nightlyDescShards,
    );
    let stdSearcher = new DocSearch(
        "std",
        await IndexManager.getStdStableIndex(),
        await getBaseUrl(),
        stdDescShards,
    );

    /**
     * @param {any} index
     * @param {{ href: any; displayPath: string; name: any; desc: any; }} doc
     */
    function formatDoc(index, doc) {
        let content = doc.href;
        let description = doc.displayPath + `<match>${doc.name}</match>`;
        if (doc.desc) {
            description += ` - <dim>${Compat.escape(Compat.eliminateTags(doc.desc))}</dim>`;
        }

        return { content, description };
    }

    let headless = new HeadlessOmnibox({
        onSearch: async (query) => {
            return await stdSearcher.search(query);
        },
        onFormat: formatDoc,
        onAppend: async (query) => {
            return [{
                content: await stdSearcher.getSearchUrl(query),
                description: `Search Rust docs <match>${query}</match> on ${await settings.isOfflineMode ? "offline mode" : await stdSearcher.rootPath}`,
            }];
        },
    });
    headless.addRegexQueryEvent(/^s(?:rc)?:/i, {
        name: "Source code",
        onSearch: async (query) => {
            query = query.replace(/^s(?:rc)?:/i, "");
            return await stdSearcher.search(query);
        },
        onFormat: (index, doc) => {
            let { content, description } = formatDoc(index, doc);
            let url = new URL(doc.href);
            url.search = "?mode=src";
            content = url.toString();
            description = `[Source code] ${description}`;
            return { content, description };
        },
        onAppend: async (query) => {
            return [{
                content: await stdSearcher.getSearchUrl(query),
                description: `Search Rust docs <match>${query}</match> on ${await settings.isOfflineMode ? "offline mode" : await stdSearcher.rootPath}`,
            }];
        },
    });

    // Nightly std docs search
    headless.addPrefixQueryEvent("/", {
        name: "Nightly docs",
        onSearch: async (query) => {
            query = query.replaceAll("/", "").trim();
            return await nightlySearcher.search(query);
        },
        onFormat: (index, doc) => {
            let { content, description } = formatDoc(index, doc);
            return { content, description: '[Nightly] ' + description };
        },
        onAppend: async (query) => {
            query = query.replaceAll("/", "").trim();
            return [{
                content: await nightlySearcher.getSearchUrl(query),
                description: `Search nightly Rust docs <match>${query}</match> on ${nightlySearcher.rootPath}`,
            }];
        },
    });

    headless.addPrefixQueryEvent("~", {
        name: "External docs",
        isDefaultSearch: async () => {
            return (await settings.defaultSearch).thirdPartyDocs;
        },
        searchPriority: 1,
        onSearch: async (query) => {
            return await crateDocSearcher.searchAll(query);
        },
        onFormat: formatDoc,
    });

    headless.addPrefixQueryEvent("@", {
        name: "Crate docs",
        onSearch: async (query) => {
            return await crateDocSearcher.search(query);
        },
        onFormat: (index, item) => {
            if ('content' in item) {
                // 1. Crate list header.
                // 2. Crate result footer
                return item;
            } else if ('href' in item) {
                return formatDoc(index, item);
            } else {
                // Crate name list.
                let content = `@${item.name}`;
                return {
                    content,
                    description: `<match>${content}</match> v${item.version} - <dim>${Compat.escape(Compat.eliminateTags(item.doc))}</dim>`,
                };
            }
        },
        onAppend: () => {
            let content = "https://query.rs/crates";
            if (Compat.isRunningInWebExtension()) {
                content = chrome.runtime.getURL("manage/crates.html");
            }
            return [{
                content,
                description: `Remind: <dim>Select here to manage all your indexed crates</dim>`,
            }];
        },
    });


    /** @param {*} query */
    async function onSearchCrates(query) {
        let results = crateSearcher.search(query);
        const seenIds = new Set(results.map(crate => crate.id.replace(/-/g, "_")));
        if (results.length < headless.maxSuggestionSize) {
            let keyword = query.replace(/[!\s]/g, "");
            let crates = await searchCrates(keyword);
            for (const crate of crates) {
                let crateId = crate.id.replace(/-/g, "_");
                if (!seenIds.has(crateId)) {
                    results.push({
                        id: crate.id,
                        version: crate.max_stable_version,
                        description: crate.description,
                    });
                    seenIds.add(crateId);
                }
            }
        }
        return results;
    }

    headless.addPrefixQueryEvent("!", {
        name: "docs.rs",
        isDefaultSearch: async () => {
            return (await settings.defaultSearch).docsRs;
        },
        searchPriority: 2,
        onSearch: onSearchCrates,
        onFormat: (index, crate) => {
            return {
                content: `https://docs.rs/${crate.id}`,
                description: `${Compat.capitalize("docs.rs")}: <match>${crate.id}</match> v${crate.version} - <dim>${Compat.escape(Compat.eliminateTags(crate.description))}</dim>`,
            };
        },
        onAppend: (query) => {
            let keyword = query.replace(/[!\s]/g, "");
            return [{
                content: "https://docs.rs/releases/search?query=" + encodeURIComponent(keyword),
                description: "Search Rust crates for " + `<match>${keyword}</match>` + " on https://docs.rs",
            }];
        },
    });

    headless.addPrefixQueryEvent("!!", {
        name: "crates.io",
        onSearch: onSearchCrates,
        onFormat: async (index, crate) => {
            let crateRegistry = await settings.crateRegistry;
            return {
                content: `https://${crateRegistry}/crates/${crate.id}`,
                description: `${Compat.capitalize(crateRegistry)}: <match>${crate.id}</match> v${crate.version} - <dim>${Compat.escape(Compat.eliminateTags(crate.description))}</dim>`,
            };
        },
        onAppend: async (query) => {
            let crateRegistry = await settings.crateRegistry;
            let keyword = query.replace(/[!\s]/g, "");
            return [{
                content: `https://${crateRegistry}/search?q=` + encodeURIComponent(keyword),
                description: "Search Rust crates for " + `<match>${keyword}</match>` + ` on https://${crateRegistry}`,
            }];
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
            return [{
                content: "https://github.com/search?q=" + encodeURIComponent(keyword),
                description: "Search Rust crates for " + `<match>${keyword}</match>` + " on https://github.com",
            }];
        },
    });

    headless.addPrefixQueryEvent("#", {
        name: "Attributes",
        isDefaultSearch: async () => {
            return (await settings.defaultSearch).attributes;
        },
        searchPriority: 3,
        onSearch: (query) => {
            query = query.replace(/[[\]]/g, "");
            return attributeSearcher.search(query);
        },
        onFormat: (index, attribute) => {
            return {
                content: attribute.href,
                description: `Attribute: <match>#[${attribute.name}]</match> <dim>${Compat.escape(attribute.description)}</dim>`,
            };
        },
    });

    headless.addPrefixQueryEvent("?", {
        name: "Can I use",
        onSearch: (query) => {
            return caniuseSearcher.search(query);
        },
        onFormat: (index, feat, query) => {
            return {
                content: `https://caniuse.rs/features/${feat.slug}`,
                description: `Can I use: <match>${Compat.escape(feat.match)}</match> [${feat.version}] - <dim>${Compat.escape(feat.description)}</dim>`
            };
        },
        onAppend: () => {
            return [{
                content: ":rfc",
                description: `Remind: <dim>you can use</dim> :rfc <dim>command to search all Rust RFCs.</dim>`,
            }];
        },
    });

    headless.addRegexQueryEvent(/^`?e\d{2,4}`?$/i, {
        name: "Error code",
        onSearch: async (query) => {
            query = query.replace("`", "");
            let baseIndex = parseInt(query.slice(1).padEnd(4, '0'));
            let result = [];
            for (let i = 0; i < 10; i++) {
                let errorIndex = 'E' + String(baseIndex++).padStart(4, "0").toUpperCase();
                result.push(errorIndex);
            }

            let baseUrl = await getBaseUrl();
            return result.map(errorCode => {
                return {
                    content: `${baseUrl}error_codes/${errorCode}.html`,
                    description: `Open error code <match>${errorCode}</match> on error codes index`,
                };
            });
        },
    });

    headless.addPrefixQueryEvent("%", {
        name: "Books",
        onSearch: (query) => {
            return bookSearcher.search(query);
        },
        onFormat: (index, page) => {
            let parentTitles = page.parentTitles || [];
            return {
                content: page.url,
                description: `${[...parentTitles.map(t => Compat.escape(t)), `<match>${Compat.escape(page.title)}</match>`].join(" > ")} - <dim>${page.name}</dim>`
            }
        },
        onAppend: () => {
            return [{
                content: ":book",
                description: `Remind: <dim>you can use</dim> :book <dim>command to search all Rust books.</dim>`,
            }];
        },
    });

    headless.addPrefixQueryEvent(">", {
        name: "Clippy lints",
        onSearch: (query) => {
            return lintSearcher.search(query);
        },
        onFormat: (_, lint) => {
            return {
                content: `https://rust-lang.github.io/rust-clippy/master/#${lint.name}`,
                description: `Clippy lint: [${lint.level}] <match>${lint.name}</match> - <dim>${Compat.escape(Compat.eliminateTags(lint.description))}</dim>`,
            }
        },
    });

    headless.addPrefixQueryEvent(":", {
        name: "Commands",
        onSearch: async (query) => {
            return commandManager.execute(query);
        },
    });

    return headless;
}

/**
 * @param {Omnibox} omnibox
 */
export async function start(omnibox) {
    const headless = await initHeadlessOmnibox();
    omnibox.extendFromHeadless(headless);
    omnibox.bootstrap({
        onEmptyNavigate: (content, disposition) => {
            commandManager.handleCommandEnterEvent(content, disposition);
        },
        beforeNavigate: async (query, content) => {
            if (content && /^@\w+$/i.test(content.trim())) {
                // Case: @crate, redirect to that crate's docs.rs page
                return `https://docs.rs/${content.replace("@", "")}`;
            } else if (content && /^https?.*\/~\/\*\/.*/ig.test(content)) {
                // Sanitize docs url which from all crates doc search mode. (Prefix with "~")
                // Here is the url instance: https://docs.rs/~/*/reqwest/fn.get.html
                let [_, __, libName] = new URL(content).pathname.slice(1).split("/");
                let crate = await CrateDocManager.getCrateByName(libName);
                const crateVersion = await settings.keepCratesUpToDate ? "latest" : crate.version;
                return content.replace("/~/", `/${crate.crateName || libName}/`).replace("/*/", `/${crateVersion}/`);
            } else {
                return content;
            }
        },
        afterNavigated: async (query, result) => {
            // Ignore the command history
            if (query?.startsWith(":")) return;

            // Only keep the latest 100 of search history.
            let { content, description } = result;
            description = description.substring(0, description.indexOf("| Page"));
            let historyItem = await HistoryCommand.record(query, { content, description }, 100);
            let statistics = await Statistics.load();
            await statistics.record(historyItem, true);
        },
    });
}