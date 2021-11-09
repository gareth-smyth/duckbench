const IFFWrapperChunk = require('../IFF/IFFWrapperChunk');
const IFFChunk = require('../IFF/IFFChunk');
const IFFFile = require('../IFF/IFFFile');

const HIRES_LACED = 0x00029004;
const LORES = 0x00029000;

class ScreenMode {
    constructor(displayMode, depth) {
        this.displayMode = displayMode;
        this.depth = depth;
    }

    static write(screenMode, filename) {
        const iffFile = new IFFWrapperChunk('FORM', 'PREF');
        const header = new IFFChunk('PRHD', Buffer.alloc(6, 0));
        const screenModeData = Buffer.alloc(28, 0);
        screenModeData.writeInt32BE(screenMode.displayMode, 16);
        screenModeData.writeInt16BE(-1, 20);
        screenModeData.writeInt16BE(-1, 22);
        screenModeData.writeInt16BE(screenMode.depth, 24);
        screenModeData.writeInt16BE(1, 26);
        const prefs = new IFFChunk('SCRM', screenModeData);
        iffFile.addChild(header);
        iffFile.addChild(prefs);
        IFFFile.write(filename, iffFile);
    }
}

module.exports = {ScreenMode, HIRES_LACED, LORES};
