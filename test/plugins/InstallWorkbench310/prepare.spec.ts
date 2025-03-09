import fs from 'fs';
import path from 'path';
import {ScreenMode}  from '../../../src/services/prefs/ScreenMode.js';
import InstallWorkbench310  from '../../../src/plugins/InstallWorkbench310/index.js';

const pluginBasePath = '../../../src/plugins/InstallWorkbench310';

vi.mock('fs');
vi.mock('../../../src/services/prefs/ScreenMode');

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
    installWorkbench310.prepare(config, environmentSetup, settings);

    const expectedCopyFrom = path.join(import.meta.dirname, pluginBasePath, 'files', 'wb3.1_install.patch');
    const expectedCopyTo = path.join('aFolder', 'wb3.1_install.patch');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('copies the install key', async () => {
    const installWorkbench310 = new InstallWorkbench310();
    installWorkbench310.prepare(config, environmentSetup, settings);

    const expectedCopyFrom = path.join(import.meta.dirname, pluginBasePath, 'files', 'wb3.1_install_key');
    const expectedCopyTo = path.join('aFolder', 'wb3.1_install_key');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('copies the startup sequence patch when floppy is false', async () => {
    const installWorkbench310 = new InstallWorkbench310();
    installWorkbench310.prepare(config, {floppyDrive: false, executionFolder: 'aFolder'}, settings);

    const expectedCopyFrom = path.join(import.meta.dirname, pluginBasePath, 'files', 'wb3.1_no_floppy_startup.patch');
    const expectedCopyTo = path.join('aFolder', 'wb3.1_no_floppy_startup.patch');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('creates the screen mode prefs file when customisePrefs is set', async () => {
    const installWorkbench310 = new InstallWorkbench310();
    installWorkbench310.prepare(config, environmentSetup, settings);

    const expectedCopyTo = path.join('aFolder', 'screenmode.prefs');
    expect(ScreenMode.write).toHaveBeenCalledWith(expect.any(ScreenMode), expectedCopyTo);
});

it('does not create the screen mode prefs file when customisePrefs is set to No', async () => {
    const installWorkbench310 = new InstallWorkbench310();
    installWorkbench310.prepare({optionValues: {customisePrefs: 'No'}}, environmentSetup, settings);

    expect(ScreenMode.write).not.toHaveBeenCalled();
});
