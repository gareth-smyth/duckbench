const fs = require('fs');
jest.mock('fs');

const SettingsService = require('../../../src/services/SettingsService');

it('returns an empty object when settings file does not exist', () => {
    fs.existsSync.mockReturnValueOnce(false);
    expect(SettingsService.loadCurrent()).toEqual({});
});

it('loads and returns the settings file when it exists', () => {
    fs.existsSync.mockReturnValueOnce(true);
    fs.readFileSync.mockReturnValueOnce(JSON.stringify({a: 'one'}));
    expect(SettingsService.loadCurrent()).toEqual({a: 'one'});
});
