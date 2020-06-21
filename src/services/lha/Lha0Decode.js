class Lha0Decode {
    constructor(compressedBuffer) {
        this.compressedBuffer = compressedBuffer;
    }

    decode() {
        return this.compressedBuffer;
    }
}

module.exports = Lha0Decode;
