const fs = require('fs');
const path = require('path');

const EnvironmentSetup = require('../../../src/builder/EnvironmentSetup');
const ADFService = require('../../../src/services/ADFService');
const HardDriveService = require('../../../src/services/HardDriveService');

jest.mock('fs');
jest.mock('../../../src/builder/EnvironmentSetup');
jest.mock('../../../src/services/ADFService');
jest.mock('../../../src/services/HardDriveService');

const Setup = require('../../../src/plugins/Setup');

let environmentSetup;

beforeEach(() => {
    environmentSetup = new EnvironmentSetup({});
    environmentSetup.duckbenchConfig = {
        osFolder: 'someOsFolder',
    };
    environmentSetup.executionFolder = 'some folder';
});

it('inserts the boot disk', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(environmentSetup.insertDisk).toHaveBeenCalledWith('DF0', {location: path.join('some folder', 'boot.adf')});
});

it('inserts the workbench disk', async () => {
    environmentSetup.getWorkbenchDiskFileName.mockReturnValue('amiga-os-310-workbench.adf');
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(environmentSetup.insertDisk)
        .toHaveBeenCalledWith('DF1', {name: 'amiga-os-310-workbench.adf', type: 'amigaos'});
});

it('maps the host cache drive', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(environmentSetup.mapFolderToDrive)
        .toHaveBeenCalledWith('DB5', path.join(process.cwd(), 'cache'), 'DB_HOST_CACHE');
});

it('maps the external tools drive', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(environmentSetup.mapFolderToDrive)
        .toHaveBeenCalledWith('DB4', path.join(process.cwd(), 'external_tools'), 'DB_TOOLS');
});

it('maps the os disks drive', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(environmentSetup.mapFolderToDrive).toHaveBeenCalledWith('DB3', 'someOsFolder', 'DB_OS_DISKS');
});

it('maps the running execution drive', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(environmentSetup.mapFolderToDrive).toHaveBeenCalledWith('DB2', 'some folder', 'DB_EXECUTION', true);
});

it('creates and adds the cache partition when it does not exist', async () => {
    fs.existsSync.mockReturnValueOnce(false);
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(HardDriveService.createRDB).toHaveBeenCalledTimes(2);
    expect(environmentSetup.attachHDF).toHaveBeenCalledTimes(2);

    const clientCacheLocation = path.join(global.CACHE_DIR, 'client_cache.hdf');
    expect(HardDriveService.createRDB)
        .toHaveBeenCalledWith(clientCacheLocation, 250, [{'driveName': 'DB1', 'fileSystem': 'pfs', 'size': 250}]);
    expect(environmentSetup.attachHDF).toHaveBeenCalledWith('DB1', clientCacheLocation);
});

it('does not create the cache partition when it already exists', async () => {
    fs.existsSync.mockReturnValueOnce(true);
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(HardDriveService.createRDB).toHaveBeenCalledTimes(1);
    expect(environmentSetup.attachHDF).toHaveBeenCalledTimes(2);
});

it('creates and adds the duckbench partition', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    const expectedHDFLocation = path.join('some folder', 'duckbench.hdf');
    expect(HardDriveService.createRDB)
        .toHaveBeenCalledWith(expectedHDFLocation, 100, [{'driveName': 'DB0', 'fileSystem': 'pfs', 'size': 100}]);
    expect(environmentSetup.attachHDF).toHaveBeenCalledWith('DB0', expectedHDFLocation);
});

it('creates the boot ADF with the required setup files', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(ADFService.createBootableADF).toHaveBeenCalledWith(path.join('some folder', 'boot.adf'), 'DuckBoot');
    expect(ADFService.createFile).toHaveBeenCalledTimes(2);
    const auxFileLocation = path.join(__dirname, '../../../src/plugins/Setup/', 'amigaFiles/file_AUX');
    expect(ADFService.createFile)
        .toHaveBeenCalledWith(path.join('some folder', 'boot.adf'), 'AUX', auxFileLocation);
    const startupSequenceLocation =
        path.join(__dirname, '../../../src/plugins/Setup/', 'amigaFiles/s/file_startup-sequence');
    expect(ADFService.createFile)
        .toHaveBeenCalledWith(path.join('some folder', 'boot.adf'), 's/startup-sequence', startupSequenceLocation);
    expect(ADFService.createDirectory).toHaveBeenCalledTimes(2);
    expect(ADFService.createDirectory).toHaveBeenCalledWith(path.join('some folder', 'boot.adf'), '', 's');
    expect(ADFService.createDirectory).toHaveBeenCalledWith(path.join('some folder', 'boot.adf'), '', 't');
});
