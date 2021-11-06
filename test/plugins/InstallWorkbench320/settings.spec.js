const path = require('path');

const fs = require('fs');
jest.mock('fs');

const SystemDiskService = require('../../../src/services/SystemDiskService');
jest.mock('../../../src/services/SystemDiskService');

const Settings = require('../../../src/plugins/InstallWorkbench320/settings');

describe('get', () => {
    it('returns the top level details', () => {
        const settings = new Settings();
        const wb320Settings = settings.get();
        expect(wb320Settings.name).toEqual('InstallWorkbench320');
        expect(wb320Settings.label).toEqual('Workbench 3.2');
    });

    it('returns a setting for each disk', () => {
        const settings = new Settings();
        const wb320Settings = settings.get();
        expect(wb320Settings.settings.length).toEqual(11);
        expect(wb320Settings.settings[0].name).toEqual('install');
        expect(wb320Settings.settings[0].type).toEqual('hostFile');
        expect(wb320Settings.settings[0].label).toEqual('Install disk');
        expect(wb320Settings.settings[0].hasDefaultSearch).toEqual(true);
    });

    it('returns cached true setting when cache marker exists', () => {
        fs.existsSync.mockReturnValue(true);
        const settings = new Settings();
        const wb320Settings = settings.get();
        expect(wb320Settings.settings.length).toEqual(11);
        expect(wb320Settings.settings[0].cached).toEqual(true);
    });

    it('returns cached false setting when cache marker does not exist', () => {
        fs.existsSync.mockReturnValue(false);
        const settings = new Settings();
        const wb320Settings = settings.get();
        expect(wb320Settings.settings.length).toEqual(11);
        expect(wb320Settings.settings[0].cached).toEqual(false);
    });
});

describe('default', ()=> {
    it('returns an empty object when neither DUCKBENCH_DISKS or AMIGAFOREVERDATA is set', async () => {
        delete process.env.DUCKBENCH_DISKS;
        delete process.env.AMIGAFOREVERDATA;

        const settings = new Settings();
        const def = await settings.default('aSetting');

        expect(def).toEqual({});
    });

    it('calls system disk service when DUCKBENCH_DISKS is set', async () => {
        process.env.DUCKBENCH_DISKS = 'somePlace';
        SystemDiskService.find.mockResolvedValueOnce('theValue');

        const settings = new Settings();
        const def = await settings.default('aSetting');

        expect(def).toEqual('theValue');
        expect(SystemDiskService.find).toHaveBeenCalledWith('3.2', 'aSetting', 'somePlace');
    });

    it('calls system disk service when AMIGAFOREVERDATA is set', async () => {
        delete process.env.DUCKBENCH_DISKS;
        process.env.AMIGAFOREVERDATA = 'somePlace';
        SystemDiskService.find.mockResolvedValueOnce('theValue');

        const settings = new Settings();
        const def = await settings.default('aSetting');

        expect(def).toEqual('theValue');
        expect(SystemDiskService.find).toHaveBeenCalledWith('3.2', 'aSetting', path.join('somePlace', 'Shared', 'adf'));
    });
});
