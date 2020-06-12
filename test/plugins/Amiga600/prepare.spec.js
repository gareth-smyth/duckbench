const Amiga600 = require('../../../src/plugins/Amiga600');

const config = {
    optionValues: {
        processor: '68090',
        fastMem: '3TB',
        chipMem: '1',
        rom: '2.05',
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
        setRom: jest.fn(),
    };
});

it('sets the system name', async () => {
    const amiga600 = new Amiga600();
    await amiga600.prepare(config, environmentSetup);

    expect(environmentSetup.setSystemName).toHaveBeenCalledWith('a600');
});

it('sets the ROM', async () => {
    const amiga600 = new Amiga600();
    await amiga600.prepare(config, environmentSetup);

    expect(environmentSetup.setRom).toHaveBeenCalledWith('2.05');
});

it('sets the CPU', async () => {
    const amiga600 = new Amiga600();
    await amiga600.prepare(config, environmentSetup);

    expect(environmentSetup.setCPU).toHaveBeenCalledWith('68090');
});

it('sets the chip mem', async () => {
    const amiga600 = new Amiga600();
    await amiga600.prepare(config, environmentSetup);

    expect(environmentSetup.setChipMem).toHaveBeenCalledWith('1');
});

it('sets the fast mem', async () => {
    const amiga600 = new Amiga600();
    await amiga600.prepare(config, environmentSetup);

    expect(environmentSetup.setFastMem).toHaveBeenCalledWith('3TB');
});

it('sets the floppy', async () => {
    const amiga600 = new Amiga600();
    await amiga600.prepare(config, environmentSetup);

    expect(environmentSetup.setFloppyDrive).toHaveBeenCalledWith(true);
});
