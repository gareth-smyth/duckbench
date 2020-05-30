const Bitmap = require('./Bitmap');
const CheckSum = require('./CheckSum');
const Name = require('./Name');
const Type = require('./Type');

const BLOCK_TYPE = 2;
const SECONDARY_TYPE_DIRECTORY = 2;

class Directory {
    constructor(diskBuffer, directoryBuffer, diskConfig) {
        this.diskConfig = diskConfig;
        this.diskBuffer = diskBuffer;
        this.buffer = directoryBuffer;
        const nameBuffer = this.buffer.slice(this.diskConfig.BLOCK_SIZE - 80, this.diskConfig.BLOCK_SIZE - 49);
        this.name = new Name(nameBuffer, this.diskConfig);
        this.fileListItem = new FileListItem(diskBuffer, this.buffer, this.diskConfig);
        this.diskBitmap = new Bitmap(this.diskBuffer, this.diskConfig);
        this.type = new Type(this.buffer, this.diskConfig);
        this.checkSum = new CheckSum(this.buffer, 20);
    }

    initialise(block, name, parent) {
        this.name.set(name);
        this.type.write(BLOCK_TYPE, SECONDARY_TYPE_DIRECTORY);
        this.buffer.writeUInt32BE(block, 4); // Self
        this.buffer.writeUInt32BE(parent || this.diskConfig.ROOT_BLOCK, this.diskConfig.BLOCK_SIZE - 12);
        this.checkSum.write();
    }

    findDirectory(path) {
        const paths = path.split('/');
        if (paths.length === 1) {
            if (paths[0] === '') {
                return this;
            }
            return this.findFile(paths[0]);
        }
        const firstDir = this.findFile(paths[0]);
        return firstDir.findDirectory(paths.slice(1).join('/'));
    }

    findFile(fileName) {
        const files = this.getFiles();
        for (let fileBlockIndex = 0; fileBlockIndex < files.length; fileBlockIndex++) {
            const name = files[fileBlockIndex].getName().get();
            if (fileName.toUpperCase() === name.toUpperCase()) {
                return files[fileBlockIndex];
            }
        }
    }

    getFiles() {
        const files = [];
        for (let i = 24; i < 24 + this.diskConfig.HASH_TABLE_SIZE_LONGS * 4; i += 4) {
            const sector = this.buffer.readUInt32BE(i);
            if (sector > 0) {
                const address = sector * this.diskConfig.BLOCK_SIZE;
                let file = FileFactory.build(this.diskBuffer, address, this.diskConfig);
                files.push(file);
                file = file.getNextWithSameHash();
                while (file) {
                    files.push(file);
                    file = file.getNextWithSameHash();
                }
            }
        }
        return files;
    }

    addFile(fileName, fileContent) {
        const freeBlock = this.diskBitmap.getFreeBlock();
        const freeBlockAddress = freeBlock * this.diskConfig.BLOCK_SIZE;
        const blockEndAddress = freeBlockAddress + this.diskConfig.BLOCK_SIZE;
        const fileBuffer = this.diskBuffer.slice(freeBlockAddress, blockEndAddress);
        const file = new File(this.diskBuffer, fileBuffer, this.diskConfig);
        file.initialise(freeBlock, fileName, this.buffer.readUInt32BE(4));
        this.addNamedThing(file, freeBlock);
        file.writeContent(fileContent);
        this.checkSum.write();
    }

    addDirectory(directoryName) {
        const freeBlock = this.diskBitmap.getFreeBlock();
        const freeBlockAddress = freeBlock * this.diskConfig.BLOCK_SIZE;
        const freeBlockEndAddress = freeBlockAddress + this.diskConfig.BLOCK_SIZE;
        const directoryBuffer = this.diskBuffer.slice(freeBlockAddress, freeBlockEndAddress);
        const directory = new Directory(this.diskBuffer, directoryBuffer, this.diskConfig);
        directory.initialise(freeBlock, directoryName, this.buffer.readUInt32BE(4));
        this.addNamedThing(directory, freeBlock);
        this.checkSum.write();
    }

    addNamedThing(namedThing, freeBlock) {
        const nameHash = namedThing.getName().getHash();
        const fileAtHash = this.buffer.readUInt32BE(nameHash * 4 + 24);
        if (fileAtHash > 0) {
            const fileWithHashAddress = fileAtHash * this.diskConfig.BLOCK_SIZE;
            const itemWithSameHash = FileFactory.build(this.diskBuffer, fileWithHashAddress, this.diskConfig);
            itemWithSameHash.addToEndOfHashList(namedThing);
        } else {
            this.buffer.writeUInt32BE(freeBlock, nameHash * 4 + 24);
        }
        this.checkSum.write();
    }

    addToEndOfHashList(fileListItem) {
        this.fileListItem.addToEndOfHashList(fileListItem);
        this.checkSum.write();
    }

    getNextWithSameHash() {
        return this.fileListItem.getNextWithSameHash();
    }

    setNextWithSameHash(next) {
        return this.fileListItem.setNextWithSameHash(next);
    }

    getName() {
        return this.name;
    }

    getSelf() {
        return this.fileListItem.getSelf();
    }
}

module.exports = Directory;

const FileFactory = require('./FileFactory');
const FileListItem = require('./FileListItem');
const File = require('./File');
