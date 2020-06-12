const CD32 = require('../../../src/plugins/CD32');

const config = {
    optionValues: {
        processor: '68090',
        fastMem: '3TB',
        floppyDrive: 'Yes',
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
    const cd32 = new CD32();
    await cd32.prepare(config, environmentSetup);

    expect(environmentSetup.setSystemName).toHaveBeenCalledWith('cd32');
});

it('sets the ROM', async () => {
    const amiga600 = new CD32();
    await amiga600.prepare(config, environmentSetup);

    expect(environmentSetup.setRom).toHaveBeenCalledWith('3.1');
});

it('sets the CPU', async () => {
    const cd32 = new CD32();
    await cd32.prepare(config, environmentSetup);

    expect(environmentSetup.setCPU).toHaveBeenCalledWith('68090');
});

it('sets the chip mem', async () => {
    const cd32 = new CD32();
    await cd32.prepare(config, environmentSetup);

    expect(environmentSetup.setChipMem).toHaveBeenCalledWith('2');
});

it('sets the fast mem', async () => {
    const cd32 = new CD32();
    await cd32.prepare(config, environmentSetup);

    expect(environmentSetup.setFastMem).toHaveBeenCalledWith('3TB');
});

it('sets the floppy when yes', async () => {
    const cd32 = new CD32();
    await cd32.prepare(config, environmentSetup);

    expect(environmentSetup.setFloppyDrive).toHaveBeenCalledWith(true);
});

it('sets the floppy when not yes', async () => {
    const cd32 = new CD32();
    await cd32.prepare(Object.assign(config, {optionValues: {floppyDrive: 'No'}}), environmentSetup);

    expect(environmentSetup.setFloppyDrive).toHaveBeenCalledWith(false);
});
