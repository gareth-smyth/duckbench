const fs = require('fs');
const os = require('os');
const path = require('path');

const adfService = require('../../src/services/ADFService');

const createdFiles = [];
const littleTempFileName = path.join(os.tmpdir(), 'testfile.txt');

beforeEach(() => {
    fs.writeFileSync(littleTempFileName, Buffer.alloc(10, 2, 'UTF-8'));
    createdFiles.push(littleTempFileName);
});

afterEach(() => {
    createdFiles.forEach((file) => {
        fs.unlinkSync(file);
    });
    createdFiles.length = 0;
});

it('creates a disk', () => {
    const diskFileName = path.join(os.tmpdir(), 'testCreated1.adf');
    createdFiles.push(diskFileName);
    adfService.createBootableADF(diskFileName, 'My disk');

    const info = adfService.info(diskFileName);
    expect(info.size).toEqual(901120);
    expect(info.name).toEqual('My disk');
    expect(info.bootable).toEqual(true);

    const files = adfService.readFiles(diskFileName);
    expect(files.length).toEqual(0);
});

it('creates files', () => {
    const diskFileName = path.join(os.tmpdir(), 'testCreated2.adf');
    createdFiles.push(diskFileName);
    adfService.createBootableADF(diskFileName, 'My disk');
    adfService.createFile(diskFileName, 'test-data1.txt', littleTempFileName);
    adfService.createFile(diskFileName, 'test-data2.bin', littleTempFileName);

    const files = adfService.readFiles(diskFileName);
    expect(files.length).toEqual(2);
    expect(files[0]).toEqual('test-data1.txt');
    expect(files[1]).toEqual('test-data2.bin');
});

it('handles attempts to overfill the disk', () => {
    const bigTempFileName = path.join(os.tmpdir(), 'bigTestFile.txt');
    fs.writeFileSync(bigTempFileName, Buffer.alloc(35000, 2, 'UTF-8'));
    const diskFileName = path.join(os.tmpdir(), 'testCreated7.adf');
    createdFiles.push(diskFileName);
    createdFiles.push(bigTempFileName);
    adfService.createBootableADF(diskFileName, 'My disk');
    try {
        for (let i = 0; i < 28; i++) {
            adfService.createFile(diskFileName, `test-data${i}.txt`, bigTempFileName);
        }
    } catch (err) {
        expect(err.message).toEqual('Could not allocate free block');
        return;
    }
    throw (Error('Expected exception but got success'));
});

it('creates files with same hash', () => {
    const diskFileName = path.join(os.tmpdir(), 'testCreated3.adf');
    createdFiles.push(diskFileName);
    adfService.createBootableADF(diskFileName, 'My disk');
    adfService.createFile(diskFileName, 'AF.txt', littleTempFileName);
    adfService.createFile(diskFileName, 'JA.txt', littleTempFileName);
    adfService.createFile(diskFileName, 'HQA.txt', littleTempFileName);

    const files = adfService.readFiles(diskFileName);
    expect(files.length).toEqual(3);
    expect(files[0]).toEqual('AF.txt');
    expect(files[1]).toEqual('JA.txt');
    expect(files[2]).toEqual('HQA.txt');
});

it('creates directories with same hash', () => {
    const diskFileName = path.join(os.tmpdir(), 'testCreated4.adf');
    createdFiles.push(diskFileName);
    adfService.createBootableADF(diskFileName, 'My disk');
    adfService.createDirectory(diskFileName, '', 'AF.txt');
    adfService.createDirectory(diskFileName, '', 'JA.txt');
    adfService.createDirectory(diskFileName, '', 'HQA.txt');

    const files = adfService.readFiles(diskFileName);
    expect(files.length).toEqual(3);
    expect(files[0]).toEqual('AF.txt');
    expect(files[1]).toEqual('JA.txt');
    expect(files[2]).toEqual('HQA.txt');
});

it('creates directories', () => {
    const diskFileName = path.join(os.tmpdir(), 'testCreated5.adf');
    createdFiles.push(diskFileName);
    adfService.createBootableADF(diskFileName, 'My disk');
    adfService.createDirectory(diskFileName, '', 'dir1');
    adfService.createDirectory(diskFileName, 'dir1', 'dir2');
    adfService.createFile(diskFileName, 'test-data1.txt', littleTempFileName);
    adfService.createFile(diskFileName, 'dir1/dir2/test-data2.bin', littleTempFileName);

    const files = adfService.readFiles(diskFileName);
    expect(files.length).toEqual(2);
    expect(files[0]).toEqual('test-data1.txt');
    expect(files[1]).toEqual('dir1');

    const subFiles = adfService.readFiles(diskFileName, 'dir1/dir2');
    expect(subFiles.length).toEqual(1);
    expect(subFiles[0]).toEqual('test-data2.bin');
});

it('handles attempts to list contents of a non existing directory', () => {
    const diskFileName = path.join(os.tmpdir(), 'testCreated6.adf');
    createdFiles.push(diskFileName);
    adfService.createBootableADF(diskFileName, 'My disk');
    adfService.createDirectory(diskFileName, '', 'some-dir');

    const files = adfService.readFiles(diskFileName, 'some-other-dir');
    expect(files.length).toEqual(0);
});
