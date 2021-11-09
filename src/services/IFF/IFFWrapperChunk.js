class IFFWrapperChunk {
    constructor(type, groupType) {
        this.type = type;
        this.groupType = groupType;
        this.children = [];
        this.selfSize = 12;
    }

    addChild(childChunk) {
        this.children.push(childChunk);
    }

    getPaddedSize() {
        return this.children.reduce((total, child) => {
            return total + child.getPaddedSize();
        }, this.selfSize);
    }

    write(buffer, initialPosition = 0) {
        buffer.write(this.type);
        buffer.writeUInt32BE(this.getPaddedSize() - this.selfSize + 4, initialPosition + 4);
        buffer.write(this.groupType, initialPosition + 8);
        let offset = this.selfSize;
        this.children.forEach((child) => {
            child.write(buffer, offset);
            offset += child.getPaddedSize();
        });
    }
}

module.exports = IFFWrapperChunk;
