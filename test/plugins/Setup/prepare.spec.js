const fs = require('fs');
const path = require('path');

const EnvironmentSetup = require('../../../src/builder/EnvironmentSetup');
const ADFService = require('../../../src/services/ADFService');
const RDBService = require('../../../src/services/RDBService');

jest.mock('fs');
jest.mock('../../../src/builder/EnvironmentSetup');
jest.mock('../../../src/services/ADFService');
jest.mock('../../../src/services/RDBService');

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

    expect(environmentSetup.mapFolderToDrive).toHaveBeenCalledWith('DB2', 'some folder', 'DB_EXECUTION');
});

it('creates and adds the cache partition when it does not exist', async () => {
    fs.existsSync.mockReturnValueOnce(false);
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(RDBService.createRDB).toHaveBeenCalledTimes(2);
    expect(environmentSetup.attachHDF).toHaveBeenCalledTimes(2);
    expect(RDBService.createRDB).toHaveBeenCalledWith(path.join(global.CACHE_DIR, 'client_cache.hdf'), 100, 'DB1');
    expect(environmentSetup.attachHDF).toHaveBeenCalledWith('DB1', path.join(global.CACHE_DIR, 'client_cache.hdf'));
});

it('does not create or add the cache partition when it already exists', async () => {
    fs.existsSync.mockReturnValueOnce(true);
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(RDBService.createRDB).toHaveBeenCalledTimes(1);
    expect(environmentSetup.attachHDF).toHaveBeenCalledTimes(1);
});

it('creates and adds the duckbench partition', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(RDBService.createRDB).toHaveBeenCalledWith(path.join('some folder', 'duckbench.hdf'), 100, 'DB0');
    expect(environmentSetup.attachHDF).toHaveBeenCalledWith('DB0', path.join('some folder', 'duckbench.hdf'));
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
