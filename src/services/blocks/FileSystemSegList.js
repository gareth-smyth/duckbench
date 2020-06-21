const fs = require('fs');

class FileSystemSegList {
    read(file, firstBlockPtr, hardDriveConfig) {
        this.hardDriveConfig = hardDriveConfig;
        this.firstBlockPointer = firstBlockPtr;
        this.buffers = [];

        let nextLoadSegBlock = firstBlockPtr;
        let bufferIndex = 0;
        while (nextLoadSegBlock !== -1) {
            this.buffers[bufferIndex] = Buffer.alloc(hardDriveConfig.blockSize, 0);

            const bytePositionOfBlock = nextLoadSegBlock * this.hardDriveConfig.blockSize;
            fs.readSync(file, this.buffers[bufferIndex], 0, this.buffers[bufferIndex].length, bytePositionOfBlock);

            nextLoadSegBlock = this.getNextLoadSegBlock(bufferIndex);
            bufferIndex += 1;
        }
    }

    write(hardDriveConfig, file) {
        this.buffers.forEach((buffer, bufferIndex) => {
            const bytePositionOfBlock = (this.firstBlockPointer + bufferIndex) * hardDriveConfig.blockSize;
            fs.writeSync(file, buffer, 0, buffer.length, bytePositionOfBlock);
        });
    }

    create(hardDriveConfig, fileSystemDefinition) {
        this.firstBlockPointer = fileSystemDefinition.firstSegListBlock;
        this.buffers = [];
        for (let bufferIndex = 0; bufferIndex < fileSystemDefinition.reservedBlocks; bufferIndex++) {
            this.buffers[bufferIndex] = Buffer.alloc(hardDriveConfig.blockSize, 0);
            this.setId(bufferIndex, 'LSEG');
            this.setHostId(bufferIndex, 7);

            const dataBytesPerBlock = hardDriveConfig.blockSize - 20;
            const firstByte = dataBytesPerBlock * bufferIndex;
            const lastByte = Math.min(
                dataBytesPerBlock * (bufferIndex + 1),
                fileSystemDefinition.fileSystemBinary.length,
            );
            this.setLoadData(bufferIndex, fileSystemDefinition.fileSystemBinary, firstByte, lastByte);

            this.setStructureSize(bufferIndex, Math.min(
                hardDriveConfig.blockSize / 4,
                ((lastByte - firstByte) / 4) + 5,
            ));

            if (lastByte - firstByte < dataBytesPerBlock) {
                this.setNextLoadSegBlock(bufferIndex, 0xFFFFFFFF);
            } else {
                this.setNextLoadSegBlock(bufferIndex, this.firstBlockPointer + bufferIndex + 1);
            }

            this.setCheckSum(bufferIndex);
        }
    }

    checkSum(bufferIndex) {
        let sum = 0;
        for (let byteIndex = 0; byteIndex < this.buffers[bufferIndex].length; byteIndex += 4) {
            sum += this.buffers[bufferIndex].readInt32BE(byteIndex);
        }
        return (-sum) & 0xffffffff;
    }

    setCheckSum(bufferIndex) {
        this.buffers[bufferIndex].writeInt32BE(this.checkSum(bufferIndex), 8);
    }

    setHostId(bufferIndex, hostId) {
        this.buffers[bufferIndex].writeUInt32BE(hostId, 12);
    }

    setLoadData(bufferIndex, fileSystemBinary, firstByte, lastByte) {
        fileSystemBinary.copy(this.buffers[bufferIndex], 20, firstByte, lastByte);
    }

    setId(bufferIndex, id) {
        this.buffers[bufferIndex].write(id, 0);
    }

    setStructureSize(bufferIndex, size) {
        this.buffers[bufferIndex].writeUInt32BE(size, 4);
    }

    setNextLoadSegBlock(bufferIndex, blockPtr) {
        this.buffers[bufferIndex].writeUInt32BE(blockPtr, 16);
    }

    getNextLoadSegBlock(bufferIndex) {
        return this.buffers[bufferIndex].readInt32BE(16);
    }
}

module.exports = FileSystemSegList;
