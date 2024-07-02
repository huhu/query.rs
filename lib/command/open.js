import Command from "./index.js";
import { Omnibox } from "omnibox-js";

/**
 * A command simply to quick open the specific url.
 */
export default class OpenCommand extends Command {
    /**
     *
     * @param name The command name. (without command prefix)
     * @param description The command description.
     * @param url The url to open
     * @param blankResult The blankResult is a object: {content, description}.
     */
    constructor(name, description, url, blankResult) {
        super(name, description);
        this.url = url;
        this.blankResult = blankResult;
    }

    onEnter(content, disposition) {
        Omnibox.navigateToUrl(this.url, disposition);
    }

    onBlankResult(arg) {
        return [{
            content: this.blankResult.content,
            description: this.blankResult.description,
        }];
    }
};