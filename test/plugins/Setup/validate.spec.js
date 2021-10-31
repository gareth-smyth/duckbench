const fs = require('fs');
const path = require('path');

jest.mock('fs');

const Setup = require('../../../src/plugins/Setup');

let settings;
const config = undefined;
const environmentSetup = undefined;

beforeEach(() => {
    fs.existsSync.mockClear();
    settings = {
        InstallWorkbench310: [
            {name: 'workbench', value: {file: 'workbench.adf'}},
        ],
        Setup: [
            {name: 'emulatorRoot', value: {folder: '/path/to/a/'}},
            {name: 'rom310', value: {file: 'myrom.rom'}},
        ],
    };
});

it('returns no errors when setup is valid and WinUAE exists', () => {
    fs.existsSync.mockReturnValue(true);
    const errors = new Setup().validate(config, environmentSetup, settings);
    expect(errors).toEqual([]);
    expect(fs.existsSync).toHaveBeenCalledWith('workbench.adf');
    expect(fs.existsSync).toHaveBeenCalledWith('myrom.rom');
    expect(fs.existsSync).toHaveBeenCalledWith(path.join('/path/to/a/', 'WinUAE.exe'));
    expect(fs.existsSync).toHaveBeenCalledTimes(3);
});

it('returns no errors when setup is valid and WinUAE64 exists', () => {
    fs.existsSync.mockReturnValueOnce(true);
    fs.existsSync.mockReturnValueOnce(false);
    fs.existsSync.mockReturnValueOnce(true);
    fs.existsSync.mockReturnValueOnce(true);
    const errors = new Setup().validate(config, environmentSetup, settings);
    expect(errors).toEqual([]);
    expect(fs.existsSync).toHaveBeenCalledWith('workbench.adf');
    expect(fs.existsSync).toHaveBeenCalledWith(path.join('/path/to/a/', 'WinUAE.exe'));
    expect(fs.existsSync).toHaveBeenCalledWith(path.join('/path/to/a/', 'WinUAE64.exe'));
    expect(fs.existsSync).toHaveBeenCalledWith('myrom.rom');
    expect(fs.existsSync).toHaveBeenCalledTimes(4);
});

it('returns an error when workbench disk is not set', () => {
    fs.existsSync.mockReturnValue(true);
    settings['InstallWorkbench310'][0].value.file = '';
    const errors = new Setup().validate(config, environmentSetup, settings);
    expect(errors).toContainEqual({type: 'error', text: 'Workbench 3.1 ADF could not be found'});
    expect(errors.length).toEqual(1);
});

it('returns an error when workbench disk is set but does not exist', () => {
    fs.existsSync.mockReturnValue(false);
    const errors = new Setup().validate(config, environmentSetup, settings);
    expect(errors).toContainEqual({type: 'error', text: 'Workbench 3.1 ADF could not be found at workbench.adf'});
    expect(fs.existsSync).toHaveBeenCalledWith('workbench.adf');
});

it('returns an error when winUAE path is not set', () => {
    fs.existsSync.mockReturnValueOnce(true);
    settings['Setup'][0].value.folder = '';
    const errors = new Setup().validate(config, environmentSetup, settings);
    expect(errors).toContainEqual({type: 'error', text: 'Path to WinUAE is not set'});
});

it('returns an error when emulator path is set but can not find either executable', () => {
    fs.existsSync.mockReturnValueOnce(true);
    fs.existsSync.mockReturnValueOnce(false);
    fs.existsSync.mockReturnValueOnce(false);
    const errors = new Setup().validate(config, environmentSetup, settings);
    expect(errors).toContainEqual({type: 'error', text: 'Could not find WinUAE executable at /path/to/a/'});
    expect(fs.existsSync).toHaveBeenCalledWith(path.join('/path/to/a/', 'WinUAE.exe'));
    expect(fs.existsSync).toHaveBeenCalledWith(path.join('/path/to/a/', 'WinUAE64.exe'));
});

it('returns an error when rom file is not set', () => {
    fs.existsSync.mockReturnValueOnce(true);
    fs.existsSync.mockReturnValueOnce(true);
    fs.existsSync.mockReturnValueOnce(true);
    settings['Setup'][1].value.file = '';
    const errors = new Setup().validate(config, environmentSetup, settings);
    expect(errors).toContainEqual({type: 'error', text: 'Path to 310 rom file is not set'});
});

it('returns an error when rom file is set but does not exist', () => {
    fs.existsSync.mockReturnValueOnce(true);
    fs.existsSync.mockReturnValueOnce(true);
    fs.existsSync.mockReturnValueOnce(false);
    const errors = new Setup().validate(config, environmentSetup, settings);
    expect(errors).toContainEqual({type: 'error', text: 'Could not find 310 ROM file at myrom.rom'});
    expect(fs.existsSync).toHaveBeenCalledWith('myrom.rom');
});
