import fs from 'fs';
import path from 'path';

vi.mock('fs');
const mockedFs = fs as MockedObject<typeof fs>;

import Setup  from '../../../src/plugins/Setup/index.js';
import {MockedObject} from "vitest";

let settings;
const config = undefined;
const environmentSetup = undefined;

beforeEach(() => {
    mockedFs.existsSync.mockClear();
    settings = {
        InstallWorkbench310: [
            {name: 'workbench', value: {file: 'workbench.adf'}},
        ],
        Setup: [
            {name: 'emulatorRoot', value: {folder: '/path/to/a/'}},
            {name: 'rom310', value: {file: 'my_rom.rom'}},
        ],
    };
});

it('returns no errors when setup is valid and WinUAE exists', () => {
    mockedFs.existsSync.mockReturnValue(true);
    const errors = new Setup().validate(config, environmentSetup, settings);
    expect(errors).toEqual([]);
    expect(fs.existsSync).toHaveBeenCalledWith('workbench.adf');
    expect(fs.existsSync).toHaveBeenCalledWith('my_rom.rom');
    expect(fs.existsSync).toHaveBeenCalledWith(path.join('/path/to/a/', 'WinUAE.exe'));
    expect(fs.existsSync).toHaveBeenCalledTimes(3);
});

it('returns no errors when setup is valid and WinUAE64 exists', () => {
    mockedFs.existsSync.mockReturnValueOnce(true);
    mockedFs.existsSync.mockReturnValueOnce(false);
    mockedFs.existsSync.mockReturnValueOnce(true);
    mockedFs.existsSync.mockReturnValueOnce(true);
    const errors = new Setup().validate(config, environmentSetup, settings);
    expect(errors).toEqual([]);
    expect(fs.existsSync).toHaveBeenCalledWith('workbench.adf');
    expect(fs.existsSync).toHaveBeenCalledWith(path.join('/path/to/a/', 'WinUAE.exe'));
    expect(fs.existsSync).toHaveBeenCalledWith(path.join('/path/to/a/', 'WinUAE64.exe'));
    expect(fs.existsSync).toHaveBeenCalledWith('my_rom.rom');
    expect(fs.existsSync).toHaveBeenCalledTimes(4);
});

it('returns an error when workbench disk is not set', () => {
    mockedFs.existsSync.mockReturnValue(true);
    settings['InstallWorkbench310'][0].value.file = '';
    const errors = new Setup().validate(config, environmentSetup, settings);
    expect(errors).toContainEqual({type: 'error', text: 'Workbench 3.1 ADF could not be found'});
    expect(errors.length).toEqual(1);
});

it('returns an error when workbench disk is set but does not exist', () => {
    mockedFs.existsSync.mockReturnValue(false);
    const errors = new Setup().validate(config, environmentSetup, settings);
    expect(errors).toContainEqual({type: 'error', text: 'Workbench 3.1 ADF could not be found at workbench.adf'});
    expect(fs.existsSync).toHaveBeenCalledWith('workbench.adf');
});

it('returns an error when winUAE path is not set', () => {
    mockedFs.existsSync.mockReturnValueOnce(true);
    settings['Setup'][0].value.folder = '';
    const errors = new Setup().validate(config, environmentSetup, settings);
    expect(errors).toContainEqual({type: 'error', text: 'Path to emulator is not set'});
});

it('returns an error when emulator path is set but can not find either executable', () => {
    mockedFs.existsSync.mockReturnValueOnce(true);
    mockedFs.existsSync.mockReturnValueOnce(false);
    mockedFs.existsSync.mockReturnValueOnce(false);
    mockedFs.existsSync.mockReturnValueOnce(false);
    const errors = new Setup().validate(config, environmentSetup, settings);
    expect(errors).toContainEqual({type: 'error', text: 'Could not find emulator executable at /path/to/a/'});
    expect(fs.existsSync).toHaveBeenCalledWith(path.join('/path/to/a/', 'WinUAE.exe'));
    expect(fs.existsSync).toHaveBeenCalledWith(path.join('/path/to/a/', 'WinUAE64.exe'));
    expect(fs.existsSync).toHaveBeenCalledWith(path.join('/path/to/a/', 'FS-UAE.app'));
});

it('returns an error when rom file is not set', () => {
    mockedFs.existsSync.mockReturnValueOnce(true);
    mockedFs.existsSync.mockReturnValueOnce(true);
    mockedFs.existsSync.mockReturnValueOnce(true);
    settings['Setup'][1].value.file = '';
    const errors = new Setup().validate(config, environmentSetup, settings);
    expect(errors).toContainEqual({type: 'error', text: 'Path to 310 rom file is not set'});
});

it('returns an error when rom file is set but does not exist', () => {
    mockedFs.existsSync.mockReturnValueOnce(true);
    mockedFs.existsSync.mockReturnValueOnce(true);
    mockedFs.existsSync.mockReturnValueOnce(false);
    const errors = new Setup().validate(config, environmentSetup, settings);
    expect(errors).toContainEqual({type: 'error', text: 'Could not find 310 ROM file at my_rom.rom'});
    expect(fs.existsSync).toHaveBeenCalledWith('my_rom.rom');
});
