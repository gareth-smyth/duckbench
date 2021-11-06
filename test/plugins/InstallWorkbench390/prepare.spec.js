const fs = require('fs-extra');
const path = require('path');

const pluginBasePath = '../../../src/plugins/InstallWorkbench390';
const InstallWorkbench390 = require(pluginBasePath);

jest.mock('fs-extra');

beforeEach(() => {
    global.Logger = {info: jest.fn(), trace: jest.fn(), debug: jest.fn()};
});

it('copies the installer patch', async () => {
    const installWorkbench390 = new InstallWorkbench390();
    await installWorkbench390.prepare(
        {optionValues: {iso390: 'a_folder'}},
        {floppyDrive: true, executionFolder: 'aFolder', insertCDISO: jest.fn()},
        {'InstallWorkbench390': [{name: 'isoLocation', value: {file: 'isoFile'}}]},
    );

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'files', 'wb3.9_install.patch');
    const expectedCopyTo = path.join('aFolder', 'wb3.9_install.patch');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('copies the install key', async () => {
    const installWorkbench390 = new InstallWorkbench390();
    await installWorkbench390.prepare(
        {optionValues: {iso390: 'a_folder'}},
        {floppyDrive: true, executionFolder: 'aFolder', insertCDISO: jest.fn()},
        {'InstallWorkbench390': [{name: 'isoLocation', value: {file: 'isoFile'}}]},
    );

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'files', 'wb3.9_install_key');
    const expectedCopyTo = path.join('aFolder', 'wb3.9_install_key');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('copies the startup sequence patch when floppy is false', async () => {
    const installWorkbench390 = new InstallWorkbench390();
    await installWorkbench390.prepare(
        {optionValues: {iso390: 'a_folder'}},
        {floppyDrive: false, executionFolder: 'aFolder', insertCDISO: jest.fn()},
        {'InstallWorkbench390': [{name: 'isoLocation', value: {file: 'isoFile'}}]},
    );

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'files', 'wb3.9_no_floppy_startup.patch');
    const expectedCopyTo = path.join('aFolder', 'wb3.9_no_floppy_startup.patch');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('inserts the ISO if workbench has not been cached', async () => {
    fs.existsSync.mockReturnValueOnce(false);

    const insertCDISO = jest.fn();
    const installWorkbench390 = new InstallWorkbench390();
    await installWorkbench390.prepare(
        {optionValues: {iso390: 'a_folder'}},
        {floppyDrive: false, executionFolder: 'aFolder', insertCDISO},
        {'InstallWorkbench390': [{name: 'isoLocation', value: {file: 'isoFile'}}]},
    );

    expect(insertCDISO).toHaveBeenCalledWith('isoFile');
});

it('does not insert the ISO if workbench is already cached', async () => {
    fs.existsSync.mockReturnValueOnce(true);

    const insertCDISO = jest.fn();
    const installWorkbench390 = new InstallWorkbench390();
    await installWorkbench390.prepare(
        {optionValues: {iso390: 'a_folder'}},
        {floppyDrive: false, executionFolder: 'aFolder', insertCDISO},
        {'InstallWorkbench390': [{name: 'isoLocation', value: {file: 'isoFile'}}]},
    );

    expect(insertCDISO).toHaveBeenCalledTimes(0);
});
