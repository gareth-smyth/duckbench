const fs = require('fs-extra');
const path = require('path');

const InstallWorkbench390 = require('../../../src/plugins/InstallWorkbench390');

jest.mock('fs-extra');

it('copies the hard drive after installation is complete', async () => {
    const installWorkbench310 = new InstallWorkbench390();
    await installWorkbench310.finalise({}, {executionFolder: '/somefolder/', systemName: 'A7000+'});

    expect(fs.copyFileSync).toHaveBeenCalledTimes(1);
    const expectedOutputFolder = path.join(process.cwd(), 'Workbench390_A7000+.hdf');
    const expectedInputFolder = path.join('/somefolder/', 'NewWorkbench.hdf');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedInputFolder, expectedOutputFolder);
});
