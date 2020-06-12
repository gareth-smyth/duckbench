const path = require('path');

const ADFService = require('../../../src/services/ADFService');

const MockPartition = jest.fn();
jest.mock('../../../src/services/ADFService');
jest.mock('../../../src/plugins/SinglePartition', () => MockPartition);

const mockPartitionInstance = {
    install: jest.fn(),
    prepare: jest.fn(),
};

const Setup = require('../../../src/plugins/Setup');

const environmentSetup = {
    duckbenchConfig: {
        osFolder: 'someOsFolder',
    },
    executionFolder: 'some folder',
    insertDisk: jest.fn(),
    mapFolderToDrive: jest.fn(),
    setRom: jest.fn(),
    setCPU: jest.fn(),
    setChipMem: jest.fn(),
    getWorkbenchDiskFileName: jest.fn().mockReturnValueOnce( 'amiga-os-310-workbench.adf'),
};

beforeEach(() => {
    ADFService.createBootableADF.mockReset();
    ADFService.createFile.mockReset();
    ADFService.createDirectory.mockReset();
    MockPartition.mockImplementation(() => mockPartitionInstance);
});

it('inserts the boot disk', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(environmentSetup.insertDisk).toHaveBeenCalledWith('DF0', {location: path.join('some folder', 'boot.adf')});
});

it('inserts the workbench disk', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(environmentSetup.insertDisk)
        .toHaveBeenCalledWith('DF1', {name: 'amiga-os-310-workbench.adf', type: 'amigaos'});
});

it('maps the external tools drive', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(environmentSetup.mapFolderToDrive)
        .toHaveBeenCalledWith('DH6', path.join(process.cwd(), 'external_tools'), 'DB_TOOLS');
});

it('maps the workbench disks drive', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(environmentSetup.mapFolderToDrive)
        .toHaveBeenCalledWith('DH5', 'someOsFolder', 'DB_OS_DISKS');
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

it('prepares the duckbench partition', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(MockPartition).toHaveBeenCalledWith();
    expect(mockPartitionInstance.prepare).toHaveBeenCalledWith({
        name: 'SinglePartition',
        optionValues: {
            device: 'DH1',
            volumeName: 'DUCKBENCH',
            size: 100,
        },
    }, environmentSetup);
});
