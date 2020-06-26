const fs = require('fs-extra');
const path = require('path');

const pluginBasePath = '../../../src/plugins/InstallWorkbench390';
const InstallWorkbench390 = require(pluginBasePath);

jest.mock('fs-extra');

beforeEach(() => {
    global.Logger = {info: jest.fn(), trace: jest.fn(), debug: jest.fn()};
});

it('copies the install key', async () => {
    const installWorkbench390 = new InstallWorkbench390();
    await installWorkbench390.prepare(
        {optionValues: {iso390: 'a_folder'}},
        {floppyDrive: true, executionFolder: 'aFolder'},
    );

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'install_key');
    const expectedCopyTo = path.join('aFolder', 'wb390_install_key');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('copies the startup sequence patch when floppy is false', async () => {
    const installWorkbench390 = new InstallWorkbench390();
    await installWorkbench390.prepare(
        {optionValues: {iso390: 'a_folder'},
        }, {floppyDrive: false, executionFolder: 'aFolder'},
    );

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'wb3.9_no_floppy_startup.patch');
    const expectedCopyTo = path.join('aFolder', 'wb3.9_no_floppy_startup.patch');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('does not copy the wb3.9 source when already cached', async () => {
    fs.existsSync.mockReturnValueOnce(true);

    const installWorkbench390 = new InstallWorkbench390();
    await installWorkbench390.prepare(
        {optionValues: {iso390: 'a_folder'},
        }, {floppyDrive: false, executionFolder: 'aFolder'},
    );

    expect(fs.existsSync).toHaveBeenCalledTimes(1);
    expect(fs.existsSync).toHaveBeenCalledWith(path.join(global.CACHE_DIR, 'wb390_installcd_cached'));
    expect(fs.copySync).toHaveBeenCalledTimes(0);
    expect(fs.rmdirSync).toHaveBeenCalledTimes(0);
    expect(fs.closeSync).toHaveBeenCalledTimes(0);
    expect(fs.openSync).toHaveBeenCalledTimes(0);
});

it('copies the wb3.9 source to cache when not yet cached', async () => {
    fs.existsSync.mockReturnValueOnce(false);
    fs.openSync.mockReturnValueOnce('aFileDescriptor');

    const installWorkbench390 = new InstallWorkbench390();
    await installWorkbench390.prepare(
        {optionValues: {iso390: 'a_folder'},
        }, {floppyDrive: false, executionFolder: 'aFolder'},
    );

    expect(fs.existsSync).toHaveBeenCalledTimes(1);
    expect(fs.existsSync).toHaveBeenCalledWith(path.join(global.CACHE_DIR, 'wb390_installcd_cached'));
    expect(fs.rmdirSync).toHaveBeenCalledTimes(1);
    expect(fs.rmdirSync).toHaveBeenCalledWith(path.join(global.CACHE_DIR, 'OS-Version3.9'), {'recursive': true});
    expect(fs.copySync).toHaveBeenCalledTimes(1);
    expect(fs.copySync).toHaveBeenCalledWith(
        path.join('a_folder', 'OS-Version3.9'),
        path.join(global.CACHE_DIR, 'OS-Version3.9'));
    expect(fs.openSync).toHaveBeenCalledTimes(1);
    expect(fs.openSync).toHaveBeenCalledWith(path.join(global.CACHE_DIR, 'wb390_installcd_cached'), 'w');
    expect(fs.closeSync).toHaveBeenCalledTimes(1);
    expect(fs.closeSync).toHaveBeenCalledWith('aFileDescriptor');
});
