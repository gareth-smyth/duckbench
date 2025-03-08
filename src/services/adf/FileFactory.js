
const BLOCK_SIZE = 512;

export default class FileFactory {
    static build(diskBuffer, address, diskConfig) {
        this.diskConfig = diskConfig;
        const block = diskBuffer.slice(address, address + BLOCK_SIZE);
        const type = new Type(block, this.diskConfig);
        if (type.getSecondary() === -3) {
            return new File(diskBuffer, block, this.diskConfig);
        }
        return new Directory(diskBuffer, block, this.diskConfig);
    }
}



import Directory from './Directory';
import Type from './Type';
import File from './File';
