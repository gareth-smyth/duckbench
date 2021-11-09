const fs = require('fs');
const path = require('path');
const {ScreenMode} = require('../../../src/services/prefs/ScreenMode');

const pluginBasePath = '../../../src/plugins/InstallWorkbench310';
const InstallWorkbench310 = require(pluginBasePath);

jest.mock('fs');
jest.mock('../../../src/services/prefs/ScreenMode');

beforeEach(() => {
    global.Logger = {info: jest.fn(), trace: jest.fn(), debug: jest.fn()};
});

const settings = {InstallWorkbench310: [
    {name: 'workbench', value: {file: 'wb'}},
    {name: 'install', value: {file: 'in'}},
    {name: 'fonts', value: {file: 'fo'}},
    {name: 'extras', value: {file: 'ex'}},
    {name: 'locale', value: {file: 'lo'}},
    {name: 'storage', value: {file: 'st'}},
]};

const config = {optionValues: {customisePrefs: 'Yes'}};
const environmentSetup = {floppyDrive: true, executionFolder: 'aFolder'};

it('copies the installer patch', async () => {
    const installWorkbench310 = new InstallWorkbench310();
    await installWorkbench310.prepare(config, environmentSetup, settings);

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'files', 'wb3.1_install.patch');
    const expectedCopyTo = path.join('aFolder', 'wb3.1_install.patch');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('copies the install key', async () => {
    const installWorkbench310 = new InstallWorkbench310();
    await installWorkbench310.prepare(config, environmentSetup, settings);

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'files', 'wb3.1_install_key');
    const expectedCopyTo = path.join('aFolder', 'wb3.1_install_key');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('copies the startup sequence patch when floppy is false', async () => {
    const installWorkbench310 = new InstallWorkbench310();
    await installWorkbench310.prepare(config, {floppyDrive: false, executionFolder: 'aFolder'}, settings);

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'files', 'wb3.1_no_floppy_startup.patch');
    const expectedCopyTo = path.join('aFolder', 'wb3.1_no_floppy_startup.patch');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('creates the screen mode prefs file when customisePrefs is set', async () => {
    const installWorkbench310 = new InstallWorkbench310();
    await installWorkbench310.prepare(config, environmentSetup, settings);

    const expectedCopyTo = path.join('aFolder', 'screenmode.prefs');
    expect(ScreenMode.write).toHaveBeenCalledWith(expect.any(ScreenMode), expectedCopyTo);
});

it('does not create the screen mode prefs file when customisePrefs is set to No', async () => {
    const installWorkbench310 = new InstallWorkbench310();
    await installWorkbench310.prepare({optionValues: {customisePrefs: 'No'}}, environmentSetup, settings);

    expect(ScreenMode.write).not.toHaveBeenCalled();
});
