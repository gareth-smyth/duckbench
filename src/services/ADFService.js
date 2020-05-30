const Disk = require('./adf/Disk');

class ADFService {
    static createBootableADF(diskFileName, name) {
        const disk = new Disk();
        disk.format(name);
        disk.makeBootable();
        disk.save(diskFileName);
    }

    static readFiles(diskFileName, path) {
        const disk = new Disk(diskFileName);
        return disk.list(path);
    }

    static info(diskFileName) {
        const disk = new Disk(diskFileName);
        return disk.info();
    }

    static createDirectory(diskFileName, path, directoryName) {
        const disk = new Disk(diskFileName);
        disk.createDirectory(path, directoryName);
        disk.save(diskFileName);
    }

    static createFile(diskFileName, path, source) {
        const disk = new Disk(diskFileName);
        disk.createFile(path, source);
        disk.save(diskFileName);
    }
}

module.exports = ADFService;
