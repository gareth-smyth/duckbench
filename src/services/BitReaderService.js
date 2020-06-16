class BitReaderService {
    constructor(buffer) {
        this.buffer = buffer;
        this.currentBit = 0;
    }

    read(numBits) {
        const currentByte = Math.floor(this.currentBit / 8);
        const currentBitOffset = this.currentBit % 8;

        const bytesNeeded = Math.floor(((numBits + currentBitOffset - 1) / 8) + 1);
        const bitsLeftInFirstByte = 8 - currentBitOffset;

        let bitsLeftToRead = numBits;
        let bitsLeftInNextByte = 0;
        let valueBuilder = 0;

        for (let byteIndex = 1; byteIndex <= bytesNeeded; byteIndex++) {
            const bitsLeftInThisByte = bitsLeftInNextByte || bitsLeftInFirstByte;

            let byteValue = this.buffer.readUInt8(currentByte + byteIndex - 1);
            const bitsFromThisByte = Math.min(8, bitsLeftInThisByte, bitsLeftToRead);

            bitsLeftToRead -= bitsFromThisByte;
            bitsLeftInNextByte = Math.min(8, bitsLeftToRead);

            if (byteIndex === 1) {
                // The first byte may have some bits on the LHS we do not want
                byteValue = (byteValue << currentBitOffset) & 0b11111111;
            }

            // All bytes may have some bits on the RHS we do not want
            byteValue = byteValue >> (8 - bitsFromThisByte);

            // These bits need to make room for bits from the next byte so they move left
            const alignedValue = byteValue << bitsLeftToRead;

            // Add the bits we took from the current byte to the end of the final value we are building
            valueBuilder = valueBuilder | alignedValue;
        }
        this.currentBit += numBits;

        return valueBuilder;
    }
}

module.exports = BitReaderService;
