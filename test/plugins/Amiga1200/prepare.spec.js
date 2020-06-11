const Setup = require('../../../src/plugins/Amiga1200');

const config = {
    optionValues: {
        processor: '68090',
        fastMem: '3TB',
    },
};

let environmentSetup = {};
beforeEach(() => {
    environmentSetup = {
        setSystemName: jest.fn(),
        setCPU: jest.fn(),
        setChipMem: jest.fn(),
        setFastMem: jest.fn(),
        setFloppyDrive: jest.fn(),
    };
});

it('sets the system name', async () => {
    const setup = new Setup();
    await setup.prepare(config, environmentSetup);

    expect(environmentSetup.setSystemName).toHaveBeenCalledWith('Amiga1200');
});

it('sets the CPU', async () => {
    const setup = new Setup();
    await setup.prepare(config, environmentSetup);

    expect(environmentSetup.setCPU).toHaveBeenCalledWith('68090');
});

it('sets the chip mem', async () => {
    const setup = new Setup();
    await setup.prepare(config, environmentSetup);

    expect(environmentSetup.setChipMem).toHaveBeenCalledWith('2');
});

it('sets the fast mem', async () => {
    const setup = new Setup();
    await setup.prepare(config, environmentSetup);

    expect(environmentSetup.setFastMem).toHaveBeenCalledWith('3TB');
});

it('sets the floppy', async () => {
    const setup = new Setup();
    await setup.prepare(config, environmentSetup);

    expect(environmentSetup.setFloppyDrive).toHaveBeenCalledWith(true);
});
