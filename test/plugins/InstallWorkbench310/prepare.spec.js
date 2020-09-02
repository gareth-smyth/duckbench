const fs = require('fs');
const path = require('path');

const pluginBasePath = '../../../src/plugins/InstallWorkbench310';
const InstallWorkbench310 = require(pluginBasePath);

jest.mock('fs');

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

it('copies the installer patch', async () => {
    const installWorkbench310 = new InstallWorkbench310();
    await installWorkbench310.prepare({}, {floppyDrive: true, executionFolder: 'aFolder'}, settings);

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'files', 'wb3.1_install.patch');
    const expectedCopyTo = path.join('aFolder', 'wb3.1_install.patch');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('copies the install key', async () => {
    const installWorkbench310 = new InstallWorkbench310();
    await installWorkbench310.prepare({}, {floppyDrive: true, executionFolder: 'aFolder'}, settings);

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'files', 'wb3.1_install_key');
    const expectedCopyTo = path.join('aFolder', 'wb3.1_install_key');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('copies the startup sequence patch when floppy is false', async () => {
    const installWorkbench310 = new InstallWorkbench310();
    await installWorkbench310.prepare({}, {floppyDrive: false, executionFolder: 'aFolder'}, settings);

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'files', 'wb3.1_no_floppy_startup.patch');
    const expectedCopyTo = path.join('aFolder', 'wb3.1_no_floppy_startup.patch');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});
