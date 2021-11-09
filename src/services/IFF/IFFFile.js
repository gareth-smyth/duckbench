const fs = require('fs');
const IFFWrapperChunk = require('./IFFWrapperChunk');
const IFFChunk = require('./IFFChunk');

class IFFFile {
    static readChunk(buffer, initialPos = 0) {
        const chunkType = buffer.slice(initialPos, initialPos + 4).toString();
        const dataSize = buffer.readUInt32BE(initialPos + 4);

        if (chunkType === 'FORM' || chunkType === 'CAT ' || chunkType === 'LIST' || chunkType === 'PROP') {
            const chunkGroup = buffer.slice(initialPos + 8, initialPos + 12).toString();
            const chunkData = buffer.slice(initialPos + 12, initialPos + 12 + dataSize);
            const wrapperChunk = new IFFWrapperChunk(chunkType, chunkGroup);

            let endOfChunk = false;
            let offset = 0;
            while (endOfChunk === false) {
                const chunk = this.readChunk(chunkData, offset);
                wrapperChunk.addChild(chunk);
                offset += chunk.getPaddedSize();
                if (offset >= chunkData.length) {
                    endOfChunk = true;
                }
            }

            return wrapperChunk;
        } else {
            const chunkData = buffer.slice(initialPos + 8, initialPos + 8 + dataSize);
            return new IFFChunk(chunkType, chunkData);
        }
    }

    static read(filename) {
        const buffer = fs.readFileSync(filename);
        return this.readChunk(buffer);
    }

    static write(filename, chunk) {
        const buffer = Buffer.alloc(chunk.getPaddedSize(), 0);
        chunk.write(buffer);
        fs.writeFileSync(filename, buffer);
    }
}

module.exports = IFFFile;
