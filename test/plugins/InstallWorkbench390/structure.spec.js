const fs = require('fs-extra');
const diskInfo = require('node-disk-info');

const InstallWorkbench390 = require('../../../src/plugins/InstallWorkbench390');

jest.mock('fs-extra');
jest.mock('node-disk-info');

it('returns a list of drives when the workbench 3.9 cd is not cached', async () => {
    fs.existsSync.mockReturnValue(false);
    diskInfo.getDiskInfo.mockResolvedValueOnce([{mounted: 'c:', filesystem: 'a:'}, {mounted: 'd:', filesystem: 'b:'}]);

    const installWorkbench310 = new InstallWorkbench390();
    const structure = await installWorkbench310.structure();

    expect(structure.label).toEqual('Workbench 3.9');
    expect(structure.name).toEqual('InstallWorkbench390');
    expect(structure.options.iso390.default).toEqual('c:');
    expect(structure.options.iso390.description).toEqual('The OS 3.9 Disk on the host');
    expect(structure.options.iso390.items).toEqual([
        {'label': 'c: (a:)', 'value': 'c:'}, {'label': 'd: (b:)', 'value': 'd:'},
    ]);
    expect(structure.options.iso390.type).toEqual('list');
    expect(structure.options.iso390.primary).toEqual(true);
});

it('returns a single "cached" value when ', async () => {
    fs.existsSync.mockReturnValue(true);

    const installWorkbench310 = new InstallWorkbench390();
    const structure = await installWorkbench310.structure();

    expect(structure.label).toEqual('Workbench 3.9');
    expect(structure.name).toEqual('InstallWorkbench390');
    expect(structure.options.iso390.default).toEqual('cached');
    expect(structure.options.iso390.description).toEqual('The OS 3.9 Disk on the host');
    expect(structure.options.iso390.items).toEqual([{'label': 'Already cached', 'value': 'cached'}]);
    expect(structure.options.iso390.type).toEqual('list');
    expect(structure.options.iso390.primary).toEqual(true);
});
