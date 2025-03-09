import fs from 'fs';
import path from 'path';

import EnvironmentSetup  from '../../../src/builder/EnvironmentSetup.js';
import ADFService  from '../../../src/services/ADFService.js';
import HardDriveService  from '../../../src/services/HardDriveService.js';

vi.mock('fs');
const mockedFs = fs as MockedObject<typeof fs>;
vi.mock('../../../src/builder/EnvironmentSetup');
vi.mock('../../../src/services/ADFService');
vi.mock('../../../src/services/HardDriveService');

import Setup  from '../../../src/plugins/Setup/index.js';
import {MockedObject} from "vitest";

const settings = {
    InstallWorkbench310: [{name: 'workbench', value: {file: 'aFile'}}],
};

let environmentSetup: EnvironmentSetup;

beforeEach(() => {
    environmentSetup = new EnvironmentSetup();
    environmentSetup.executionFolder = 'some folder';
});

it('inserts the boot disk', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup, settings);

    expect(environmentSetup.insertDisk).toHaveBeenCalledWith('DF0', {location: path.join('some folder', 'boot.adf')});
});

it('inserts the workbench disk', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup, settings);

    expect(environmentSetup.insertDisk).toHaveBeenCalledWith('DF1', {'location': 'aFile'});
});

it('maps the host cache drive', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup, settings);

    expect(environmentSetup.mapFolderToDrive)
        .toHaveBeenCalledWith('DB5', 'MyCacheDir:', 'DB_HOST_CACHE');
});

it('maps the external tools drive', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup, settings);

    expect(environmentSetup.mapFolderToDrive)
        .toHaveBeenCalledWith('DB4', path.join(process.cwd(), 'external_tools'), 'DB_TOOLS');
});

it('maps the running execution drive', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup, settings);

    expect(environmentSetup.mapFolderToDrive).toHaveBeenCalledWith('DB2', 'some folder', 'DB_EXECUTION', true);
});

it('creates and adds the cache partition when it does not exist', async () => {
    mockedFs.existsSync.mockReturnValueOnce(false);
    const setup = new Setup();
    await setup.prepare({}, environmentSetup, settings);

    expect(HardDriveService.createRDB).toHaveBeenCalledTimes(2);
    expect(environmentSetup.attachHDF).toHaveBeenCalledTimes(2);

    const clientCacheLocation = path.join(global.CACHE_DIR, 'client_cache.hdf');
    expect(HardDriveService.createRDB)
        .toHaveBeenCalledWith(clientCacheLocation, 250, [{'driveName': 'DB1', 'fileSystem': 'pfs', 'size': 250}]);
    expect(environmentSetup.attachHDF).toHaveBeenCalledWith('DB1', clientCacheLocation);
});

it('does not create the cache partition when it already exists', async () => {
    mockedFs.existsSync.mockReturnValueOnce(true);
    const setup = new Setup();
    await setup.prepare({}, environmentSetup, settings);

    expect(HardDriveService.createRDB).toHaveBeenCalledTimes(1);
    expect(environmentSetup.attachHDF).toHaveBeenCalledTimes(2);
});

it('creates and adds the duckbench partition', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup, settings);

    const expectedHDFLocation = path.join('some folder', 'duckbench.hdf');
    expect(HardDriveService.createRDB)
        .toHaveBeenCalledWith(expectedHDFLocation, 100, [{'driveName': 'DB0', 'fileSystem': 'pfs', 'size': 100}]);
    expect(environmentSetup.attachHDF).toHaveBeenCalledWith('DB0', expectedHDFLocation);
});

it('creates the boot ADF with the required setup files', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup, settings);

    expect(ADFService.createBootableADF).toHaveBeenCalledWith(path.join('some folder', 'boot.adf'), 'DuckBoot');
    expect(ADFService.createFile).toHaveBeenCalledTimes(2);
    const auxFileLocation = path.join(import.meta.dirname, '../../../src/plugins/Setup/', 'amigaFiles/file_AUX');
    expect(ADFService.createFile)
        .toHaveBeenCalledWith(path.join('some folder', 'boot.adf'), 'AUX', auxFileLocation);
    const startupSequenceLocation =
        path.join(import.meta.dirname, '../../../src/plugins/Setup/', 'amigaFiles/s/file_startup-sequence');
    expect(ADFService.createFile)
        .toHaveBeenCalledWith(path.join('some folder', 'boot.adf'), 's/startup-sequence', startupSequenceLocation);
    expect(ADFService.createDirectory).toHaveBeenCalledTimes(2);
    expect(ADFService.createDirectory).toHaveBeenCalledWith(path.join('some folder', 'boot.adf'), '', 's');
    expect(ADFService.createDirectory).toHaveBeenCalledWith(path.join('some folder', 'boot.adf'), '', 't');
});
