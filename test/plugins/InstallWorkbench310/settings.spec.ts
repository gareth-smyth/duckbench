import path from 'path';

import fs from 'fs';
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

import SystemDiskService from '../../../src/services/SystemDiskService';
jest.mock('../../../src/services/SystemDiskService');
const mockedSystemDiskService = SystemDiskService as jest.Mocked<typeof SystemDiskService>;

import Settings from '../../../src/plugins/InstallWorkbench310/settings';

describe('get', () => {
    it('returns the top level details', () => {
        const settings = new Settings();
        const wb310Settings = settings.get();
        expect(wb310Settings.name).toEqual('InstallWorkbench310');
        expect(wb310Settings.label).toEqual('Workbench 3.1');
    });

    it('returns a setting for each disk', () => {
        const settings = new Settings();
        const wb310Settings = settings.get();
        expect(wb310Settings.settings.length).toEqual(6);
        expect(wb310Settings.settings[0].name).toEqual('install');
        expect(wb310Settings.settings[0].type).toEqual('hostFile');
        expect(wb310Settings.settings[0].label).toEqual('Install disk');
        expect(wb310Settings.settings[0].hasDefaultSearch).toEqual(true);
    });

    it('returns cached true setting when cache marker exists', () => {
        mockedFs.existsSync.mockReturnValue(true);
        const settings = new Settings();
        const wb310Settings = settings.get();
        expect(wb310Settings.settings.length).toEqual(6);
        expect(wb310Settings.settings[0].cached).toEqual(true);
    });

    it('returns cached false setting when cache marker does not exist', () => {
        mockedFs.existsSync.mockReturnValue(false);
        const settings = new Settings();
        const wb310Settings = settings.get();
        expect(wb310Settings.settings.length).toEqual(6);
        expect(wb310Settings.settings[0].cached).toEqual(false);
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
        mockedSystemDiskService.find.mockResolvedValueOnce({file: 'theValue'});

        const settings = new Settings();
        const def = await settings.default('aSetting');

        expect(def).toEqual({file: 'theValue'});
        expect(SystemDiskService.find).toHaveBeenCalledWith('3.1', 'aSetting', 'somePlace');
    });

    it('calls system disk service when AMIGAFOREVERDATA is set', async () => {
        delete process.env.DUCKBENCH_DISKS;
        process.env.AMIGAFOREVERDATA = 'somePlace';
        mockedSystemDiskService.find.mockResolvedValueOnce({file: 'theValue'});

        const settings = new Settings();
        const def = await settings.default('aSetting');

        expect(def).toEqual({file: 'theValue'});
        expect(SystemDiskService.find).toHaveBeenCalledWith('3.1', 'aSetting', path.join('somePlace', 'Shared', 'adf'));
    });
});
