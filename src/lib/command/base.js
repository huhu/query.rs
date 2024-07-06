export default class Command {
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