const BitReader = require('../BitReaderService');
const HTree = require('./HTree');

const COPY_THRESHOLD = 3;
const HISTORY_BITS = 14;
const OFFSET_BITS = 4;
const NUM_CODES = 510;
const RING_BUFFER_SIZE = 1 << HISTORY_BITS;

class Lha5Decode {
    constructor(compressedBuffer, outSize) {
        this.ringBufPos = 0;
        this.ringBuffer = [];
        this.outBufferPosition = 0;
        this.outBuffer = Buffer.alloc(outSize, 0);
        this.bitReader = new BitReader(compressedBuffer);
    }

    decode() {
        while (this.outBuffer.length > this.outBufferPosition) {
            this.readBlock();
        }
        return this.outBuffer;
    }

    readBlock() {
        let blockRemaining = this.bitReader.read(16);
        const tempTable = this.readTempTable();
        const tempTree = new HTree(tempTable);
        const codeTable = this.readCodeTable(tempTree);
        const codeTree = new HTree(codeTable);
        const offsetTable = this.readOffsetTable(codeTree);
        const offsetTree = new HTree(offsetTable);

        while (blockRemaining > 0) {
            const code = codeTree.readCode(this.bitReader);

            if (code < 256) {
                this.outputCode(code);
            } else {
                this.copyFromHistory(code - 256 + COPY_THRESHOLD, offsetTree);
            }

            blockRemaining -= 1;
        }
    }

    outputCode(code) {
        this.outBuffer.writeUInt8(code, this.outBufferPosition);
        this.outBufferPosition += 1;

        this.ringBuffer[this.ringBufPos] = code;
        this.ringBufPos = (this.ringBufPos + 1) % RING_BUFFER_SIZE;
    }

    readOffsetCode(offsetTree) {
        const bits = offsetTree.readCode(this.bitReader);

        /* TODO Need better test files */
        /* istanbul ignore next */
        if (bits === 0) {
            return 0;
        } else if (bits === 1) {
            return 1;
        } else {
            const offset = this.bitReader.read(bits - 1);

            return offset + (1 << (bits - 1));
        }
    }

    copyFromHistory(count, offsetTree) {
        const offset = this.readOffsetCode(offsetTree);

        const start = this.ringBufPos + RING_BUFFER_SIZE - offset - 1;

        for (let i = 0; i < count; i++) {
            const code = this.ringBuffer[(start + i) % RING_BUFFER_SIZE];
            this.outputCode(code);
        }
    }

    readTempTable() {
        const numCodes = this.bitReader.read(5);

        // TODO handle numCodes zero as a special case
        /* istanbul ignore next */
        if (numCodes === 0) throw (new Error('I do not know how to handle this!'));

        return this.readTempCodeLengths(numCodes);
    }

    readCodeTable(tempTree) {
        const numCodes = this.bitReader.read(9);

        // TODO handle numCodes zero as a special case
        /* istanbul ignore next */
        if (numCodes === 0) throw (new Error('I do not know how to handle this!'));

        return this.readCodeCodeLengths(numCodes, tempTree);
    }

    readOffsetTable(codeTree) {
        const numCodes = this.bitReader.read(OFFSET_BITS);

        // TODO handle numCodes zero as a special case
        /* istanbul ignore next */
        if (numCodes === 0) throw (new Error('I do not know how to handle this!'));

        return this.readOffsetCodeLengths(numCodes, codeTree);
    }

    readTempCodeLengths(numCodes) {
        const codeLengths = [];
        for (let codeIndex = 0; codeIndex < numCodes; codeIndex++) {
            const codeLength = this.readLengthValue();

            codeLengths.push(codeLength);

            // Copied straight from lhasa without any further understanding
            // as to why you might skip some codes lengths.
            if (codeIndex === 2) {
                const skipLength = this.bitReader.read(2);

                for (let skipCodeIndex = 0; skipCodeIndex < skipLength; skipCodeIndex++) {
                    codeIndex++;
                    codeLengths.push(0);
                }
            }
        }

        return codeLengths;
    }

    readCodeCodeLengths(numCodes, tempTree) {
        const codeLengths = [];
        for (let codeIndex = 0; codeIndex < Math.min(numCodes, NUM_CODES); codeIndex++) {
            const code = tempTree.readCode(this.bitReader);

            if (code <= 2) {
                const skipLength = this.readSkipCount(code);

                for (let skipCodeIndex = 0; skipCodeIndex < skipLength; skipCodeIndex++) {
                    codeIndex++;
                    codeLengths.push(0);
                }
                codeIndex--;
            } else {
                codeLengths.push(code - 2);
            }
        }

        return codeLengths;
    }

    readOffsetCodeLengths(numCodes) {
        const codeLengths = [];
        for (let codeIndex = 0; codeIndex < numCodes; codeIndex++) {
            const codeLength = this.readLengthValue();
            codeLengths.push(codeLength);
        }

        return codeLengths;
    }

    readSkipCount(skipCode) {
        if (skipCode === 0) {
            return 1;
        } else if (skipCode === 1) {
            return 3 + this.bitReader.read(4);
        } else {
            return 20 + this.bitReader.read(9);
        }
    }

    readLengthValue() {
        let length = this.bitReader.read(3);

        /* TODO Need better test files */
        /* istanbul ignore next */
        if (length === 7) {
            while (this.bitReader.read(1) !== 0) {
                length++;
            }
        }
        return length;
    }
}

module.exports = Lha5Decode;
