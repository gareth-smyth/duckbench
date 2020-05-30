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
            Logger.debug('Installing HitEnterFile ro ram:.');
            await communicator.sendCommand('echo "\\n" > ram:HitEnterFile.txt').then((response) => {
                if (response.length > 0) {
                    throw new Error(`Expected no response when installing HitEnterFile.txt but got "${response}"`);
                }
                Logger.debug('Installed HitEnterFile.txt to ram:');
                this.installed = true;
            }).catch((err) => {
                throw new Error(err);
            });
        } else {
            Logger.trace('Not installing HitEnterFile as it has already been installed.');
        }
    }

    getFile() {
        return 'ram:HitEnterFile.txt';
    }
}

module.exports = HitEnterFile;
