import fs from 'fs-extra';
import path from 'path';
import InstallWorkbench390 from '../../../src/plugins/InstallWorkbench390';

const pluginBasePath = '../../../src/plugins/InstallWorkbench390';

jest.mock('fs-extra');
const mockedFs = fs as jest.Mocked<typeof fs>;

it('copies the installer patch', async () => {
    const installWorkbench390 = new InstallWorkbench390();
    installWorkbench390.prepare(
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
    installWorkbench390.prepare(
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
    installWorkbench390.prepare(
        {optionValues: {iso390: 'a_folder'}},
        {floppyDrive: false, executionFolder: 'aFolder', insertCDISO: jest.fn()},
        {'InstallWorkbench390': [{name: 'isoLocation', value: {file: 'isoFile'}}]},
    );

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'files', 'wb3.9_no_floppy_startup.patch');
    const expectedCopyTo = path.join('aFolder', 'wb3.9_no_floppy_startup.patch');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('inserts the ISO if workbench has not been cached', async () => {
    mockedFs.existsSync.mockReturnValueOnce(false);

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
    mockedFs.existsSync.mockReturnValueOnce(true);

    const insertCDISO = jest.fn();
    const installWorkbench390 = new InstallWorkbench390();
    await installWorkbench390.prepare(
        {optionValues: {iso390: 'a_folder'}},
        {floppyDrive: false, executionFolder: 'aFolder', insertCDISO},
        {'InstallWorkbench390': [{name: 'isoLocation', value: {file: 'isoFile'}}]},
    );

    expect(insertCDISO).toHaveBeenCalledTimes(0);
});
