import RomFinderService from '../../../src/services/RomFinderService';
jest.mock('../../../src/services/RomFinderService');
import fs from 'fs';
import path from 'path';
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;
RomFinderService.find = jest.fn();

import Settings from '../../../src/plugins/Setup/settings';

describe('emulatorRoot', () => {
    it('defaults emulator root to DUCKBENCH_EMU when it is set', () => {
        const settings = new Settings();
        process.env.DUCKBENCH_EMU = 'Some place';
        expect(settings.default('emulatorRoot')).toEqual({folder: 'Some place'});
    });

    it('defaults emulator root to C:/Program Files/WinUAE when DUCKBENCH_EMU is not set', () => {
        const settings = new Settings();
        delete process.env.DUCKBENCH_EMU;
        mockedFs.existsSync.mockReturnValueOnce(true);
        expect(settings.default('emulatorRoot')).toEqual({folder: 'C:/Program Files/WinUAE'});
    });

    it('defaults emulator root to C:/Program Files (x86)/WinUAE when DUCKBENCH_EMU is not set', () => {
        const settings = new Settings();
        delete process.env.DUCKBENCH_EMU;
        mockedFs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(true);
        expect(settings.default('emulatorRoot')).toEqual({folder: 'C:/Program Files (x86)/WinUAE'});
    });

    it('defaults emulator root to undefined when DUCKBENCH_EMU is not set and not found in program files', () => {
        const settings = new Settings();
        delete process.env.DUCKBENCH_EMU;
        mockedFs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(false);
        expect(settings.default('emulatorRoot')).toEqual({});
    });
});

describe('rom310', function() {
    it('returns an empty object when neither DUCKBENCH_ROMS or AMIGAFOREVERDATA is set', async () => {
        delete process.env.DUCKBENCH_ROMS;
        delete process.env.AMIGAFOREVERDATA;

        const settings = new Settings();
        const def = settings.default('rom310');

        expect(def).toEqual({});
    });

    it('calls system disk service when DUCKBENCH_ROMS is set', async () => {
        process.env.DUCKBENCH_ROMS = 'somePlace';
        (RomFinderService.find as jest.Mock).mockReturnValueOnce({file: 'theValue'});

        const settings = new Settings();
        const def = settings.default('rom310');

        expect(def).toEqual({file: 'theValue'});
        expect(RomFinderService.find).toHaveBeenCalledWith('3.1', 'somePlace');
    });

    it('calls system disk service when AMIGAFOREVERDATA is set', async () => {
        delete process.env.DUCKBENCH_ROMS;
        process.env.AMIGAFOREVERDATA = 'somePlace';
        (RomFinderService.find as jest.Mock).mockReturnValueOnce({file: 'theValue'});

        const settings = new Settings();
        const def = settings.default('rom310');

        expect(def).toEqual({file: 'theValue'});
        expect(RomFinderService.find).toHaveBeenCalledWith('3.1', path.join('somePlace', 'Shared', 'rom'));
    });
});
