const fs = require('fs');
const path = require('path');

const InstallWorkbench300 = require('../../../src/plugins/InstallWorkbench300');

jest.mock('fs');

beforeEach(() => {
    fs.copyFileSync.mockReset();
    global.Logger = {info: jest.fn(), trace: jest.fn(), debug: jest.fn()};
});

it('copies the installer patch', async () => {
    const installWorkbench310 = new InstallWorkbench300();
    await installWorkbench310.prepare();

    const expectedCopyFrom = path.join(__dirname, '../../../src/plugins/InstallWorkbench300', 'wb3.0_install.patch');
    const expectedCopyTo = path.join(process.cwd(), 'external_tools/wb3.0_install.patch');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it('copies the install key', async () => {
    const installWorkbench310 = new InstallWorkbench300();
    await installWorkbench310.prepare();

    const expectedCopyFrom = path.join(__dirname, '../../../src/plugins/InstallWorkbench300', 'install_key');
    const expectedCopyTo = path.join(process.cwd(), 'external_tools/install_key');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});
