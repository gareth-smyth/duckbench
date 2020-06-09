const fs = require('fs');
const path = require('path');

const InstallWorkbench310 = require('../../../src/plugins/InstallWorkbench310');

jest.mock('fs');

beforeEach(() => {
    fs.copyFileSync.mockReset();
    global.Logger = {info: jest.fn(), trace: jest.fn(), debug: jest.fn()};
});

it('copies the installer patch', async () => {
    const installWorkbench310 = new InstallWorkbench310();
    await installWorkbench310.prepare();

    const expectedCopyFrom = path.join(__dirname, '../../../src/plugins/InstallWorkbench310', 'wb3.1_install.patch');
    const expectedCopyTo = path.join(process.cwd(), 'external_tools/wb3.1_install.patch');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('copies the install key', async () => {
    const installWorkbench310 = new InstallWorkbench310();
    await installWorkbench310.prepare();

    const expectedCopyFrom = path.join(__dirname, '../../../src/plugins/InstallWorkbench310', 'install_key');
    const expectedCopyTo = path.join(process.cwd(), 'external_tools/install_key');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});
