const fs = require('fs');
const path = require('path');

const InstallWorkbench310 = require('../../../src/plugins/InstallWorkbench310');

jest.mock('fs');

it('copies the hard drive after installation is complete', async () => {
    const installWorkbench310 = new InstallWorkbench310();
    await installWorkbench310.finalise(
        {optionValues: {device: 'AA1'}},
        {executionFolder: '/somefolder/', systemName: 'A7000+'});

    expect(fs.copyFileSync).toHaveBeenCalledTimes(1);
    const expectedOutputFolder = path.join(process.cwd(), 'Workbench310_A7000+.hdf');
    const expectedInputFolder = path.join('/somefolder/', 'AA1.hdf');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedInputFolder, expectedOutputFolder);
});
