class CommandRunner {
    constructor(socketCommunicator) {
        this.socketCommunicator = socketCommunicator;
    }

    async run(commandString, options, commandCallback, expectedResponse) {
        commandString = this.addOptions(commandString, options);
        Logger.debug(`Running ${commandString}`);
        return this.socketCommunicator.runCommand(commandString, commandCallback).then((response) => {
            if (this.checkResponse(expectedResponse, response)) {
                throw new Error(`Expected "${expectedResponse}" from "${commandString}" but got "${response}"`);
            }
            Logger.debug(`Ran ${commandString}`);
        }).catch((err) => {
            throw new Error(err);
        });
    }

    checkResponse(expectedResponse, response) {
        if (expectedResponse) {
            return response.length === 0 ||
                this.checkStringResponse(expectedResponse, response) ||
                this.checkRegExResponse(expectedResponse, response) ||
                this.checkMultipleResponses(expectedResponse, response);
        } else {
            return response.length > 0;
        }
    }

    checkRegExResponse(expectedResponse, response) {
        return (expectedResponse instanceof RegExp) && (!expectedResponse.test(response.join()));
    }

    checkStringResponse(expectedResponse, response) {
        return (typeof expectedResponse === 'string') && (!response.join().includes(expectedResponse));
    }

    checkMultipleResponses(expectedResponse, response) {
        return Array.isArray(expectedResponse) && (expectedResponse.some((expectedSubResponse) => {
            return this.checkResponse(expectedSubResponse, response);
        }));
    }

    addOptions(command, options) {
        const redirectIn = options.REDIRECT_IN;
        const redirectOut = options.REDIRECT_OUT;

        Object.keys(options)
            .filter((optionKey) => optionKey !== 'REDIRECT_IN' && optionKey !== 'REDIRECT_OUT')
            .forEach((optionKey) => {
                const optionValue = options[optionKey];
                if (optionValue === true) {
                    command = `${command} ${optionKey}`;
                } else {
                    command = `${command} ${optionKey} ${optionValue}`;
                }
            });

        if (redirectIn) {
            command = `${command} < ${redirectIn}`;
        }

        if (redirectOut) {
            command = `${command} > ${redirectOut}`;
        }

        return command;
    }
}

module.exports = CommandRunner;
