import fs from 'fs';
import path from 'path';

import Communicator from '../../../src/builder/Communicator';

jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;
jest.mock('../../../src/builder/Communicator');

import WinUAETools from '../../../src/plugins/WinUAETools';

let communicator: jest.Mocked<Communicator>;
beforeEach(() => {
    communicator = new Communicator() as jest.Mocked<Communicator>;
});

const environmentSetup = {};
const settings = {'Setup': [
    {name: 'emulatorRoot', value: {folder: 'c:/some_place/'}},
    {name: 'rom310', value: {file: 'some/place'}},
]};

it('copies the tools to the cache when both not already there', async () => {
    mockedFs.existsSync.mockReturnValueOnce(false)
        .mockReturnValue(true);

    const winUAETools = new WinUAETools();
    await winUAETools.install({optionValues: {location: 'A:'}}, communicator, {}, environmentSetup, settings);
    await winUAETools.install({optionValues: {location: 'A:'}}, communicator, {}, environmentSetup, settings);
    await winUAETools.install({optionValues: {location: 'B:'}}, communicator, {}, environmentSetup, settings);

    const emuRoot = 'c:/some_place/';
    const configurationPath = path.join(emuRoot, 'Amiga Programs', 'uae-configuration');
    const ctrlPath = path.join(emuRoot, 'Amiga Programs', 'uaectrl');
    expect(fs.copyFileSync).toHaveBeenCalledTimes(2);
    expect(fs.copyFileSync).toHaveBeenCalledWith(configurationPath, path.join(global.CACHE_DIR, 'uae-configuration'));
    expect(fs.copyFileSync).toHaveBeenCalledWith(ctrlPath, path.join(global.CACHE_DIR, 'uaectrl'));
});

it('copies the tools to the cache when either not already there', async () => {
    mockedFs.existsSync.mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValue(true);

    const winUAETools = new WinUAETools();
    await winUAETools.install({optionValues: {location: 'A:'}}, communicator, {}, environmentSetup, settings);
    await winUAETools.install({optionValues: {location: 'A:'}}, communicator, {}, environmentSetup, settings);
    await winUAETools.install({optionValues: {location: 'B:'}}, communicator, {}, environmentSetup, settings);

    const emuRoot = 'c:/some_place/';
    const configurationPath = path.join(emuRoot, 'Amiga Programs', 'uae-configuration');
    const ctrlPath = path.join(emuRoot, 'Amiga Programs', 'uaectrl');
    expect(fs.copyFileSync).toHaveBeenCalledTimes(2);
    expect(fs.copyFileSync).toHaveBeenCalledWith(configurationPath, path.join(global.CACHE_DIR, 'uae-configuration'));
    expect(fs.copyFileSync).toHaveBeenCalledWith(ctrlPath, path.join(global.CACHE_DIR, 'uaectrl'));
});

it('does not copy the tools to the cache when both already exist', async () => {
    mockedFs.existsSync.mockReturnValue(true);

    const winUAETools = new WinUAETools();
    await winUAETools.install({optionValues: {location: 'A:'}}, communicator, {}, environmentSetup, settings);
    await winUAETools.install({optionValues: {location: 'A:'}}, communicator, {}, environmentSetup, settings);
    await winUAETools.install({optionValues: {location: 'B:'}}, communicator, {}, environmentSetup, settings);

    expect(fs.copyFileSync).toHaveBeenCalledTimes(0);
});

it('copies the tools to the requested location', async () => {
    const winUAETools = new WinUAETools();
    await winUAETools.install({optionValues: {location: 'A:'}}, communicator, {}, environmentSetup, settings);
    await winUAETools.install({optionValues: {location: 'A:'}}, communicator, {}, environmentSetup, settings);
    await winUAETools.install({optionValues: {location: 'B:'}}, communicator, {}, environmentSetup, settings);

    expect(communicator.copy).toHaveBeenCalledTimes(4);
    expect(communicator.copy).toHaveBeenCalledWith('DB_HOST_CACHE:uae-configuration', 'A:');
    expect(communicator.copy).toHaveBeenCalledWith('DB_HOST_CACHE:uaectrl', 'A:');
    expect(communicator.copy).toHaveBeenCalledWith('DB_HOST_CACHE:uae-configuration', 'B:');
    expect(communicator.copy).toHaveBeenCalledWith('DB_HOST_CACHE:uaectrl', 'B:');
});
