import { Compat } from "omnibox-js";
import Command from "./index.js";

/**
 * A simple command to quick setup a list item of [name, url, description] data search.
 */
export default class SimpleCommand extends Command {
    constructor(name, description, index) {
        super(name, description);
        this.setIndex(index);
    }

    async onExecute(arg) {
        return this.index
            .filter(([name, _, description]) => !arg || name.toLowerCase().indexOf(arg) > -1 || (description?.toLowerCase().indexOf(arg) > -1))
            .map(([name, url, description]) => {
                if (description) {
                    description = `<match>${name}</match> - <dim>${Compat.escape(description)}</dim>`;
                } else {
                    description = `<match>${name}</match> - <dim>${url}</dim>`;
                }
                return {
                    content: url,
                    description,
                }
            });
    }

    setIndex(index) {
        this.index = index;
    }
};