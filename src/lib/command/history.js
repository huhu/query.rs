import { Compat } from "omnibox-js";
import Command from "./base.js";
import storage from "../storage.js";

export default class HistoryCommand extends Command {
    constructor() {
        super("history", "Show your local search history.", false);
    }

    async onExecute(arg) {
        let history = await storage.getItem("history") || [];
        return history
            .filter(item => !arg || item.query.toLowerCase().indexOf(arg) > -1)
            .sort((a, b) => b.time - a.time)
            .map(item => {
                return {
                    content: item.content,
                    description: `${item.query} - ${item.description}`
                };
            });
    }

    onBlankResult(arg) {
        return [{
            content: "no history",
            description: "No history right now, let's search something!"
        }];
    }

    /**
     * Record the search history and reture the history item.
     * @param {string} query The search keyword.
     * @param {object} result The search result.
     * @param {number} maxSize The max size that should keep the search history in local storage.
     * @returns the historyItem.
     */
    static async record(query, result, maxSize) {
        if (!query || !result) return;

        let { content, description } = result;
        description = Compat.eliminateTags(description);
        let history = await storage.getItem("history") || [];
        let historyItem = { query, content, description, time: Date.now() };
        history.push(historyItem);

        if (maxSize && maxSize >= 0) {
            // Limit the search history to the max size.
            history.sort((a, b) => b.time - a.time).splice(maxSize);
        }
        await storage.setItem("history", history);
        return historyItem;
    }
};