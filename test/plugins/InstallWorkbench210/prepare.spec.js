const fs = require('fs');
const path = require('path');

const pluginBasePath = '../../../src/plugins/InstallWorkbench210';
const InstallWorkbench210 = require(pluginBasePath);

jest.mock('fs');

beforeEach(() => {
    fs.copyFileSync.mockReset();
    global.Logger = {info: jest.fn(), trace: jest.fn(), debug: jest.fn()};
});

it('copies the installer patch', async () => {
    const installWorkbench210 = new InstallWorkbench210();
    await installWorkbench210.prepare({}, {floppyDrive: true});

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'wb2.1_install.patch');
    const expectedCopyTo = path.join(process.cwd(), 'external_tools/wb2.1_install.patch');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('copies the install key', async () => {
    const installWorkbench210 = new InstallWorkbench210();
    await installWorkbench210.prepare({}, {floppyDrive: true});

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'install_key');
    const expectedCopyTo = path.join(process.cwd(), 'external_tools/install_key');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('copies the startup sequence patch when floppy is false', async () => {
    const installWorkbench210 = new InstallWorkbench210();
    await installWorkbench210.prepare({}, {floppyDrive: false});

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'wb2.1_no_floppy_startup.patch');
    const expectedCopyTo = path.join(process.cwd(), 'external_tools/wb2.1_no_floppy_startup.patch');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});
