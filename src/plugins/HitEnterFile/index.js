class HitEnterFile {
    structure() {
        return {
            name: 'HitEnterFile',
            label: 'Hit enter automator',
            description: 'Creates a file in RAM that can be directed as input ' +
                'to simulate the user hitting the enter key',
            type: 'internal',
        };
    }

    async install(config, communicator) {
        if (!this.installed) {
            await communicator.echo('\\n', {REDIRECT_OUT: 'ram:HitEnterFile.txt'});
            this.installed = true;
        } else {
            Logger.trace('Not installing HitEnterFile as it has already been installed.');
        }
    }

    getFile() {
        return 'ram:HitEnterFile.txt';
    }
}

module.exports = HitEnterFile;
