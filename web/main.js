import attributesIndex from "./lib/index/attributes.js";
import IndexManager from "./lib/index-manager.js";
import CrateSearch from "./lib/search/crate.js";
import CaniuseSearch from "./lib/search/caniuse.js";
import BookSearch from "./lib/search/book.js";
import LintSearch from "./lib/search/lint.js";
import AttributeSearch from "./lib/search/attribute.js";
import DocSearch from "./lib/search/docs/base.js";
import CrateDocSearch from "./lib/search/docs/crate-doc.js";
import LabelCommand from "./lib/command/label.js";
import RfcCommand from "./lib/command/rfc.js";
import RustcCommand from "./lib/command/rustc.js";
import TargetCommand from "./lib/command/target.js";
import HelpCommand from "./lib/command/help.js";
import StableCommand from "./lib/command/stable.js";
import {
    SimpleCommand,
    OpenCommand,
    HistoryCommand,
    CommandManager
} from "./core/index.js";
import {
    RUST_RELEASE_README_URL,
} from "./lib/constants.js";
import DescShardManager from "./lib/search/docs/desc-shard.js";
import { RustSearchOmnibox, getBaseUrl } from "./lib/index.js";


export default async function start(omnibox) {
    const crateSearcher = new CrateSearch(await IndexManager.getCrateMapping(), await IndexManager.getCrateIndex());
    let caniuseSearcher = new CaniuseSearch(await IndexManager.getCaniuseIndex());
    let bookSearcher = new BookSearch(await IndexManager.getBookIndex());
    let lintSearcher = new LintSearch(await IndexManager.getLintIndex());

    const attributeSearcher = new AttributeSearch(attributesIndex);
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
            RUST_RELEASE_README_URL, {
            content: ':release',
            description: `Press <match>Enter</match> to open rust-lang repository release page.`,
        }),
    );

    const nightlyDescShards = await DescShardManager.create("std-nightly");
    const stdDescShards = await DescShardManager.create("std-stable");
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

    RustSearchOmnibox.run({
        omnibox,
        stdSearcher,
        nightlySearcher,
        crateDocSearcher,
        crateSearcher,
        attributeSearcher,
        bookSearcher,
        caniuseSearcher,
        lintSearcher,
        commandManager,
    });
}