import {
    CrateDocSearch,
    DocSearch,
    AttributeSearch,
    LintSearch,
    BookSearch,
    CaniuseSearch,
    CrateSearch,
} from "./lib/search/index.js";
import {
    LabelCommand,
    RfcCommand,
    RustcCommand,
    TargetCommand,
    StableCommand,
    HelpCommand,
} from "./lib/command/index.js";
import {
    SimpleCommand,
    OpenCommand,
    HistoryCommand,
    CommandManager
} from "./core/index.js";
import { IndexManager, RustSearchOmnibox, DescShardManager, getBaseUrl } from "./lib/index.js";


export default async function start(omnibox) {
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