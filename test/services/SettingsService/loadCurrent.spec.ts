import fs from 'fs';
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

import SettingsService from '../../../src/services/SettingsService';

it('returns an empty object when settings file does not exist', () => {
    mockedFs.existsSync.mockReturnValueOnce(false);
    expect(SettingsService.loadCurrent()).toEqual({});
});

it('loads and returns the settings file when it exists', () => {
    mockedFs.existsSync.mockReturnValueOnce(true);
    mockedFs.readFileSync.mockReturnValueOnce(JSON.stringify({a: 'one'}));
    expect(SettingsService.loadCurrent()).toEqual({a: 'one'});
});
