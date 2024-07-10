export default class CommandManager {
    constructor(prefixOrCommand, ...commands) {
        // The `prefixOrCommand` argument was introduced at a later point, which would break
        // backwards compatibility. To avoid this breakage the following code checks if the provided
        // `prefixOrCommand` is indeed a prefix, or if it is the first command and the default
        // prefix should be used instead.
        if (typeof prefixOrCommand === 'string') {
            this.prefix = prefixOrCommand;
        } else {
            this.prefix = ":";
            commands.unshift(prefixOrCommand);
        }

        this.cmds = [];
        commands.forEach(command => this.addCommand(command));
    }

    addCommand(command) {
        if (!command) return;

        let index = this.cmds.findIndex(cmd => cmd.name === command.name);
        if (index === -1) {
            this.cmds.push(command);
        } else {
            this.cmds.splice(index, 1, command);
        }
    }

    async execute(query) {
        query = query.replace(this.prefix, "").trim().toLowerCase();
        let [name, ...keywords] = query.split(" ");
        let command = this.cmds.find(cmd => cmd.name === name);
        if (command) {
            // Join all rest keywords as the argument.
            let arg = keywords.join(" ");
            let result = await command.onExecute(arg);
            if (!result || result.length < 1) {
                result = command.onBlankResult(arg);
            }
            return result;
        } else {
            let list = this.cmds
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(cmd => {
                    return {
                        content: `${this.prefix}${cmd.name}`,
                        description: `<match>${this.prefix + cmd.name}</match> - <dim>${cmd.description}</dim>`
                    }
                });

            let result = list.filter((item) => name && item.content.indexOf(name) > -1);
            if (result.length > 0) {
                // Filter commands with prefix
                return [
                    { content: "", description: `Found following commands, press Tab to select.` },
                    ...result
                ];
            } else {
                return [
                    { content: "", description: `No <match>${this.prefix + name}</match> command found, try following commands?` },
                    ...list
                ];
            }
        }
    }

    handleCommandEnterEvent(content, disposition) {
        if (content) {
            content = content.replace(this.prefix, "").trim();
            let command = this.cmds.find(cmd => cmd.name === content);
            if (command) {
                command.onEnter(content, disposition);
            }
        }
    }
};