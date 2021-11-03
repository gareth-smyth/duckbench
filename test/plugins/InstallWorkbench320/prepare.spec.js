const fs = require('fs');
const path = require('path');

const pluginBasePath = '../../../src/plugins/InstallWorkbench320';
const InstallWorkbench320 = require(pluginBasePath);

jest.mock('fs');

beforeEach(() => {
    global.Logger = {info: jest.fn(), trace: jest.fn(), debug: jest.fn()};
});

const settings = {InstallWorkbench320: [
    {name: 'workbench', value: {file: 'wb'}},
    {name: 'install', value: {file: 'in'}},
    {name: 'fonts', value: {file: 'fo'}},
    {name: 'extras', value: {file: 'ex'}},
    {name: 'locale', value: {file: 'lo'}},
    {name: 'storage', value: {file: 'st'}},
    {name: 'locale-EN', value: {file: 'le'}},
    {name: 'diskdoctor', value: {file: 'dd'}},
    {name: 'classes', value: {file: 'ca'}},
    {name: 'backdrops', value: {file: 'bd'}},
    {name: 'modules1200', value: {file: 'm1'}},
]};

it('copies the installer patch', async () => {
    const installWorkbench320 = new InstallWorkbench320();
    await installWorkbench320.prepare({}, {floppyDrive: true, executionFolder: 'aFolder'}, settings);

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'files', 'wb3.2_install.patch');
    const expectedCopyTo = path.join('aFolder', 'wb3.2_install.patch');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('copies the install key', async () => {
    const installWorkbench320 = new InstallWorkbench320();
    await installWorkbench320.prepare({}, {floppyDrive: true, executionFolder: 'aFolder'}, settings);

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'files', 'wb3.2_install_key');
    const expectedCopyTo = path.join('aFolder', 'wb3.2_install_key');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('copies the startup sequence patch when floppy is false', async () => {
    const installWorkbench320 = new InstallWorkbench320();
    await installWorkbench320.prepare({}, {floppyDrive: false, executionFolder: 'aFolder'}, settings);

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'files', 'wb3.2_no_floppy_startup.patch');
    const expectedCopyTo = path.join('aFolder', 'wb3.2_no_floppy_startup.patch');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});
