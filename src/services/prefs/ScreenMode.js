const IFFReader = require('../IFF/IFFReader');

class ScreenMode {
    constructor(screenModePrefs) {
        this.prefs = {
            width: 0xFFFFFFFF,
            height: 0xFFFFFFFF,
            displayModeId: 0x00000000,
            ...screenModePrefs,
        };
    }

    read(filename) {
        const iffFile = IFFReader.read(filename);
    }
}

module.exports = ScreenMode;
