const fs = require('fs');
const path = require('path');

const pluginBasePath = '../../../src/plugins/InstallWorkbench300';
const InstallWorkbench300 = require(pluginBasePath);

jest.mock('fs');

beforeEach(() => {
    fs.copyFileSync.mockReset();
    global.Logger = {info: jest.fn(), trace: jest.fn(), debug: jest.fn()};
});

it('copies the installer patch', async () => {
    const installWorkbench300 = new InstallWorkbench300();
    await installWorkbench300.prepare({}, {floppyDrive: true});

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'wb3.0_install.patch');
    const expectedCopyTo = path.join(process.cwd(), 'external_tools/wb3.0_install.patch');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('copies the install key', async () => {
    const installWorkbench300 = new InstallWorkbench300();
    await installWorkbench300.prepare({}, {floppyDrive: true});

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'install_key');
    const expectedCopyTo = path.join(process.cwd(), 'external_tools/install_key');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('copies the startup sequence patch when floppy is false', async () => {
    const installWorkbench300 = new InstallWorkbench300();
    await installWorkbench300.prepare({}, {floppyDrive: false});

    const expectedCopyFrom = path.join(__dirname, pluginBasePath, 'wb3.0_no_floppy_startup.patch');
    const expectedCopyTo = path.join(process.cwd(), 'external_tools/wb3.0_no_floppy_startup.patch');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});
