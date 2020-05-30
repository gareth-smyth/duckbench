const path = require('path');

const ADFService = require('../../src/services/ADFService');

const MockPartition = jest.fn();
const MockHitEnterFile = jest.fn();
jest.mock('../../src/services/ADFService');
jest.mock('../../src/plugins/Partition', () => MockPartition);
jest.mock('../../src/plugins/HitEnterFile', () => MockHitEnterFile);

const mockPartitionInstance = {
    install: jest.fn(),
    prepare: jest.fn(),
};

const mockHitEnterFileInstance = {
    install: jest.fn(),
};

const Setup = require('../../src/plugins/Setup');

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
};

beforeEach(() => {
    ADFService.createBootableADF.mockReset();
    ADFService.createFile.mockReset();
    ADFService.createDirectory.mockReset();
    MockPartition.mockImplementation(() => mockPartitionInstance);
    MockHitEnterFile.mockImplementation(() => mockHitEnterFileInstance);
});

it('returns HitEnterFile as a dependency', () => {
    const setup = new Setup();
    const config = setup.configure();

    expect(config).toEqual([{name: 'HitEnterFile'}]);
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

it('sets the rom', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(environmentSetup.setRom).toHaveBeenCalledWith('amiga-os-310-a1200.rom');
});

it('sets the cpu', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(environmentSetup.setCPU).toHaveBeenCalledWith('68020');
});

it('sets the chipmem', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(environmentSetup.setChipMem).toHaveBeenCalledWith('2');
});

it('creates the boot ADF with the required setup files', async () => {
    const setup = new Setup();
    await setup.prepare({}, environmentSetup);

    expect(ADFService.createBootableADF).toHaveBeenCalledWith(path.join('some folder', 'boot.adf'), 'DuckBoot');
    expect(ADFService.createFile).toHaveBeenCalledTimes(2);
    const auxFileLocation = path.join(__dirname, '../../src/plugins/Setup/', 'amigaFiles/file_AUX');
    expect(ADFService.createFile)
        .toHaveBeenCalledWith(path.join('some folder', 'boot.adf'), 'AUX', auxFileLocation);
    const startupSequenceLocation =
        path.join(__dirname, '../../src/plugins/Setup/', 'amigaFiles/s/file_startup-sequence');
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
        name: 'Partition',
        optionValues: {
            device: 'DH1',
            volumeName: 'DUCKBENCH',
            size: 100,
        },
    }, environmentSetup);
});

it('installs the hit enter file', async () => {
    const communicator = {sendCommand: jest.fn()};

    const setup = new Setup();
    await setup.install({}, communicator);

    expect(MockHitEnterFile).toHaveBeenCalledWith();
    expect(mockHitEnterFileInstance.install).toHaveBeenCalledWith({}, communicator);
});

it('installs the partition', async () => {
    const communicator = {sendCommand: jest.fn()};
    const pluginStore = {getPlugin: () => ({getFile: () => 'ram:somefile.txt'})};

    const setup = new Setup();
    await setup.install({}, communicator, pluginStore);

    expect(MockPartition).toHaveBeenCalledWith();
    expect(mockPartitionInstance.install).toHaveBeenCalledWith({
        name: 'Partition',
        optionValues: {
            device: 'DH1',
            volumeName: 'DUCKBENCH',
            size: 100,
        },
    }, communicator, pluginStore);
});

it('makes and assigns the required folders', async () => {
    const communicator = {sendCommand: jest.fn()};
    const pluginStore = {getPlugin: () => ({getFile: () => 'ram:somefile.txt'})};

    const setup = new Setup();
    await setup.install({}, communicator, pluginStore);

    expect(communicator.sendCommand).toHaveBeenCalledTimes(5);
    expect(communicator.sendCommand).toHaveBeenCalledWith('makedir duckbench:c');
    expect(communicator.sendCommand).toHaveBeenCalledWith('path duckbench:c ADD');
    expect(communicator.sendCommand).toHaveBeenCalledWith('makedir duckbench:t');
    expect(communicator.sendCommand).toHaveBeenCalledWith('makedir duckbench:disks');
    expect(communicator.sendCommand).toHaveBeenCalledWith('assign t: duckbench:t');
});
