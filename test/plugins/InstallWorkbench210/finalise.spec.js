const fs = require('fs');
const path = require('path');

const InstallWorkbench210 = require('../../../src/plugins/InstallWorkbench210');

jest.mock('fs');

it('copies the hard drive after installation is complete', async () => {
    const installWorkbench210 = new InstallWorkbench210();
    await installWorkbench210.finalise({}, {executionFolder: '/somefolder/', systemName: 'A7000+'});

    expect(fs.copyFileSync).toHaveBeenCalledTimes(1);
    const expectedOutputFolder = path.join(process.cwd(), 'Workbench210_A7000+.hdf');
    const expectedInputFolder = path.join('/somefolder/', 'NewWorkbench.hdf');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedInputFolder, expectedOutputFolder);
});
