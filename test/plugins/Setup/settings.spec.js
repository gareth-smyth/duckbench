const fs = require('fs');
jest.mock('fs');

const Settings = require('../../../src/plugins/Setup/settings');

it('defaults emulator root to DUCKBENCH_EMU when it is set', () => {
    const settings = new Settings();
    process.env.DUCKBENCH_EMU = 'Some place';
    expect(settings.default('emulatorRoot')).toEqual({folder: 'Some place'});
});

it('defaults emulator root to C:/Program Files/WinUAE when DUCKBENCH_EMU is not set', () => {
    const settings = new Settings();
    delete process.env.DUCKBENCH_EMU;
    fs.existsSync.mockReturnValueOnce(true);
    expect(settings.default('emulatorRoot')).toEqual({folder: 'C:/Program Files/WinUAE'});
});

it('defaults emulator root to C:/Program Files (x86)/WinUAE when DUCKBENCH_EMU is not set', () => {
    const settings = new Settings();
    delete process.env.DUCKBENCH_EMU;
    fs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(true);
    expect(settings.default('emulatorRoot')).toEqual({folder: 'C:/Program Files (x86)/WinUAE'});
});

it('defaults emulator root to undefined when DUCKBENCH_EMU is not set and not found in program files', () => {
    const settings = new Settings();
    delete process.env.DUCKBENCH_EMU;
    fs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(false);
    expect(settings.default('emulatorRoot')).toEqual({});
});
