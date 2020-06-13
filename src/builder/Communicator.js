const CommandBuilder = require('./CommandRunner');
const SocketCommunicator = require('./SocketCommunicator');

class Communicator {
    /* istanbul ignore next */
    constructor(controlCallback = this.noCallback,
                socketCommunicator = new SocketCommunicator(controlCallback),
                commandRunner = new CommandBuilder(socketCommunicator)) {
        this.commandRunner = commandRunner;
        this.socketCommunicator = socketCommunicator;
    }

    /* istanbul ignore next */
    noCallback() { }

    async run(commandString, options, commandCallback, expectedResponse) {
        return this.commandRunner.run(commandString, options, commandCallback, expectedResponse);
    }

    async assign(name, folder, options = {}, commandCallback = this.noCallback, expectedResponse = undefined) {
        return this.commandRunner.run(`assign ${name} ${folder}`, options, commandCallback, expectedResponse);
    }

    async cd(folder, options = {}, commandCallback = this.noCallback) {
        return this.commandRunner.run(`cd ${folder}`, options, commandCallback);
    }

    async copy(source, destination, options = {}, commandCallback = this.noCallback) {
        return this.commandRunner.run(`copy ${source} ${destination}`, options, commandCallback);
    }

    async delete(filename, options = {}, commandCallback = this.noCallback) {
        const expectedResponse = `${filename}  Deleted`;
        return this.commandRunner.run(`delete ${filename}`, options, commandCallback, expectedResponse);
    }

    async echo(content, options = {}, commandCallback = this.noCallback) {
        return this.commandRunner.run(`echo "${content}"`, options, commandCallback);
    }

    async format(drive, volumeName, options = {}, commandCallback = this.noCallback) {
        const commandString = `format drive ${drive} name ${volumeName}`;
        const expectedResponse = 'Initializing disk...';
        return this.commandRunner.run(commandString, options, commandCallback, expectedResponse);
    }

    async makedir(folder, options = {}, commandCallback = this.noCallback) {
        return this.commandRunner.run(`makedir ${folder}`, options, commandCallback);
    }

    async path(folder, options = {}, commandCallback = this.noCallback) {
        return this.commandRunner.run(`path ${folder}`, options, commandCallback);
    }

    async protect(filename, options = {}, commandCallback = this.noCallback) {
        return this.commandRunner.run(`protect ${filename}`, options, commandCallback);
    }

    close() {
        this.socketCommunicator.close();
    }

    connect() {
        return this.socketCommunicator.connect();
    }
}

module.exports = Communicator;
