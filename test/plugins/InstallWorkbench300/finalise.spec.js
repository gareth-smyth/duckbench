const fs = require('fs');
const path = require('path');

const InstallWorkbench300 = require('../../../src/plugins/InstallWorkbench300');

jest.mock('fs');

it('copies the hard drive after installation is complete', async () => {
    const installWorkbench310 = new InstallWorkbench300();
    await installWorkbench310.finalise(
        {optionValues: {device: 'AA1'}},
        {executionFolder: '/somefolder/', systemName: 'A7000+'});

    expect(fs.copyFileSync).toHaveBeenCalledTimes(1);
    const expectedOutputFolder = path.join(process.cwd(), 'Workbench300_A7000+.hdf');
    const expectedInputFolder = path.join('/somefolder/', 'AA1.hdf');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedInputFolder, expectedOutputFolder);
});
