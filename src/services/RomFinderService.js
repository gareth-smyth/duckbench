const fs = require('fs');
const path = require('path');

/* This is quite complicated to test for little benefit. It's also quite likely to change a lot. */
/* istanbul ignore next */
class RomFinderService {
    static async find(romVersion, romPath) {
        const romDir = fs.opendirSync(romPath);
        const roms = [];
        let directoryEntry;
        while ((directoryEntry = romDir.readSync()) !== null) {
            roms.push(directoryEntry);
        }
        await romDir.close();

        if (!this.romCache) {
            this.romCache = {};
        }

        if (!this.romCache[romPath]) {
            this.romCache[romPath] = [];
        }

        roms.forEach((rom) => {
            if (!this.romCache[romPath][rom.name]) {
                this.romCache[romPath].push(this.examine(path.join(romPath, rom.name)));
            }
        });

        const foundRom = this.romCache[romPath].find((romInfo) => {
            if (romInfo.version === romVersion) {
                return true;
            }
        });

        return foundRom ? {file: foundRom.file} : {};
    }

    static examine(fileName) {
        if (path.extname(fileName).localeCompare('.rom', undefined, {sensitivity: 'accent'}) === 0) {
            Logger.trace(`Examining rom ${fileName}.`);
            if ((fileName.includes('3.1') || fileName.includes('310')) &&
                !fileName.includes('ext') &&
                !fileName.includes('fmv')) {
                return {version: '3.1', file: fileName};
            } else {
                return {};
            }
        } else {
            Logger.trace(`Not trying file ${fileName} as it does not appear to be a rom.`);
            return {};
        }
    }
}

module.exports = RomFinderService;
