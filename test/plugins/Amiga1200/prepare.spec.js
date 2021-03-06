const Amiga1200 = require('../../../src/plugins/Amiga1200');

const config = {
    optionValues: {
        processor: '68090',
        fastMem: '3TB',
        rom: '3.0',
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
    const amiga1200 = new Amiga1200();
    await amiga1200.prepare(config, environmentSetup);

    expect(environmentSetup.setSystemName).toHaveBeenCalledWith('a1200');
});

it('sets the ROM', async () => {
    const amiga600 = new Amiga1200();
    await amiga600.prepare(config, environmentSetup);

    expect(environmentSetup.setRom).toHaveBeenCalledWith('3.0');
});

it('sets the CPU', async () => {
    const amiga1200 = new Amiga1200();
    await amiga1200.prepare(config, environmentSetup);

    expect(environmentSetup.setCPU).toHaveBeenCalledWith('68090');
});

it('sets the chip mem', async () => {
    const amiga1200 = new Amiga1200();
    await amiga1200.prepare(config, environmentSetup);

    expect(environmentSetup.setChipMem).toHaveBeenCalledWith('2');
});

it('sets the fast mem', async () => {
    const amiga1200 = new Amiga1200();
    await amiga1200.prepare(config, environmentSetup);

    expect(environmentSetup.setFastMem).toHaveBeenCalledWith('3TB');
});

it('sets the floppy', async () => {
    const amiga1200 = new Amiga1200();
    await amiga1200.prepare(config, environmentSetup);

    expect(environmentSetup.setFloppyDrive).toHaveBeenCalledWith(true);
});
