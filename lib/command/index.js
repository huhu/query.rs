import HelpCommand from "./help.js";
import LabelCommand from "./label.js";
import RfcCommand from "./rfc.js";
import RustcCommand from "./rustc.js";
import StableCommand from "./stable.js";
import TargetCommand from "./target.js";
import HistoryCommand from "./history.js";
import CommandManager from "./manager.js";
import OpenCommand from "./open.js";
import SimpleCommand from "./simple.js";

class Command {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }

    async onExecute(arg) {
    }

    // A hook method called when press enter on command directly.
    onEnter(content, disposition) {
    }

    // A hook method called when the onExecute()'s result is empty.
    onBlankResult(arg) {
        return [];
    }

    // Wrap the result array with the default content,
    // as the content is required by omnibox api.
    wrap(result) {
        return result.map((description, index) => {
            return { content: `${index + 1}`, description };
        });
    }
};

export {
    Command,
    HistoryCommand,
    CommandManager,
    OpenCommand,
    SimpleCommand,
    HelpCommand,
    LabelCommand,
    RfcCommand,
    RustcCommand,
    StableCommand,
    TargetCommand,
};