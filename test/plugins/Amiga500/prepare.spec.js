const Amiga500 = require('../../../src/plugins/Amiga500');

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
    const amiga500 = new Amiga500();
    await amiga500.prepare(config, environmentSetup);

    expect(environmentSetup.setSystemName).toHaveBeenCalledWith('a500');
});

it('sets the ROM', async () => {
    const amiga500 = new Amiga500();
    await amiga500.prepare(config, environmentSetup);

    expect(environmentSetup.setRom).toHaveBeenCalledWith('2.05');
});

it('sets the CPU', async () => {
    const amiga500 = new Amiga500();
    await amiga500.prepare(config, environmentSetup);

    expect(environmentSetup.setCPU).toHaveBeenCalledWith('68090');
});

it('sets the chip mem', async () => {
    const amiga500 = new Amiga500();
    await amiga500.prepare(config, environmentSetup);

    expect(environmentSetup.setChipMem).toHaveBeenCalledWith('1');
});

it('sets the fast mem', async () => {
    const amiga500 = new Amiga500();
    await amiga500.prepare(config, environmentSetup);

    expect(environmentSetup.setFastMem).toHaveBeenCalledWith('3TB');
});

it('sets the floppy', async () => {
    const amiga500 = new Amiga500();
    await amiga500.prepare(config, environmentSetup);

    expect(environmentSetup.setFloppyDrive).toHaveBeenCalledWith(true);
});
