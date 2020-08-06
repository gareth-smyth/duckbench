const fs = require('fs');
const path = require('path');

const ADFService = require('./ADFService');

/* This is quite complicated to test for little benefit. It's also quite likely to change a lot. */
/* istanbul ignore next */
class SystemDiskService {
    static async find(os, disk, diskPath) {
        const diskDir = fs.opendirSync(diskPath);
        const disks = [];
        let directoryEntry;
        while ((directoryEntry = diskDir.readSync()) !== null) {
            disks.push(directoryEntry);
        }
        await diskDir.close();

        if (!this.diskCache) {
            this.diskCache = {};
        }

        if (!this.diskCache[diskPath]) {
            this.diskCache[diskPath] = [];
        }

        disks.forEach((disk) => {
            if (!this.diskCache[diskPath][disk.name]) {
                this.diskCache[diskPath].push(this.examine(path.join(diskPath, disk.name)));
            }
        });

        const foundDisk = this.diskCache[diskPath].find((diskInfo) => {
            if (diskInfo.os === os && diskInfo.disk === disk) {
                return true;
            }
        });

        return foundDisk ? {file: foundDisk.file} : {};
    }

    static examine(fileName) {
        if (path.extname(fileName).localeCompare('.adf', undefined, {sensitivity: 'accent'}) === 0) {
            Logger.trace(`Examing disk ${fileName}.`);
            const diskInfo = ADFService.info(fileName);
            switch (diskInfo.name) {
            case 'Install2.1':
                return {os: '2.1', disk: 'install', file: fileName};
            case 'Workbench2.1':
                return {os: '2.1', disk: 'workbench', file: fileName};
            case 'Extras2.1':
                return {os: '2.1', disk: 'extras', file: fileName};
            case 'Install3.0':
                return {os: '3.0', disk: 'install', file: fileName};
            case 'Workbench3.0':
                return {os: '3.0', disk: 'workbench', file: fileName};
            case 'Extras3.0':
                return {os: '3.0', disk: 'extras', file: fileName};
            case 'Storage3.0':
                return {os: '3.0', disk: 'storage', file: fileName};
            case 'Install3.1':
                return {os: '3.1', disk: 'install', file: fileName};
            case 'Workbench3.1':
                return {os: '3.1', disk: 'workbench', file: fileName};
            case 'Extras3.1':
                return {os: '3.1', disk: 'extras', file: fileName};
            case 'Storage3.1':
                return {os: '3.1', disk: 'storage', file: fileName};
            case 'Locale':
                const localeFiles = ADFService.readFiles(fileName, '');
                if (localeFiles.find((fileName) => fileName === 'Disk.info')) {
                    return {os: '3.1', disk: 'locale', file: fileName};
                } else if (localeFiles.find((fileName) => fileName === 'Help')) {
                    return {os: '3.0', disk: 'locale', file: fileName};
                } else if (localeFiles.find((fileName) => fileName === 'T')) {
                    return {os: '2.1', disk: 'locale', file: fileName};
                }
                return {};
            case 'Fonts':
                const fontFiles = ADFService.readFiles(fileName, '');
                if (fontFiles.find((fileName) => fileName === 'Disk.info')) {
                    return {os: '3.1', disk: 'fonts', file: fileName};
                } else if (fileName.includes('3.0') || fileName.includes('300')) {
                    return {os: '3.0', disk: 'fonts', file: fileName};
                } else if (fileName.includes('2.1') || fileName.includes('210')) {
                    return {os: '2.1', disk: 'fonts', file: fileName};
                } else if (fileName.includes('3')) {
                    return {os: '3.0', disk: 'fonts', file: fileName};
                } else if (fileName.includes('2')) {
                    return {os: '2.1', disk: 'fonts', file: fileName};
                }
                return {};
            default:
                return {};
            }
        } else {
            Logger.trace(`Not trying file ${fileName} as it does not appear ot be an adf.`);
            return {};
        }
    }
}

module.exports = SystemDiskService;
