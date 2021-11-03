const fs = require('fs');
const path = require('path');

const InstallWorkbench320 = require('../../../src/plugins/InstallWorkbench320');

jest.mock('fs');

it('copies the hard drive after installation is complete', async () => {
    const installWorkbench320 = new InstallWorkbench320();
    await installWorkbench320.finalise({}, {executionFolder: '/somefolder/', systemName: 'A7000+'});

    expect(fs.copyFileSync).toHaveBeenCalledTimes(1);
    const expectedOutputFolder = path.join(process.cwd(), 'InstallWorkbench320_A7000+.hdf');
    const expectedInputFolder = path.join('/somefolder/', 'NewWorkbench.hdf');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedInputFolder, expectedOutputFolder);
});
