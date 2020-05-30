class Name {
    constructor(buffer, diskConfig) {
        this.diskConfig = diskConfig;
        this.buffer = buffer;
    }

    write(name) {
        this.buffer.writeInt8(name.length, 0);
        this.buffer.write(name, 1);
    }

    get() {
        const nameSize = this.buffer.readUInt8(0);
        return this.buffer.toString('ascii', 1, nameSize + 1);
    }

    set(name) {
        this.buffer.writeInt8(name.length, 0);
        this.buffer.write(name, 1);
    }

    getHash() {
        const name = this.get();
        let hash = name.length;
        for (let index = 0; index < name.length; index++) {
            hash *= 13;
            hash += name[index].toUpperCase().charCodeAt(0);
            hash &= 0x7ff;
        }

        return hash % this.diskConfig.HASH_TABLE_SIZE_LONGS;
    }
}

module.exports = Name;
