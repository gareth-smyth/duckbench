const fs = require('fs');
jest.mock('fs');

const Settings = require('../../../src/plugins/InstallWorkbench390/settings');

it('sets cached to false when cache_flag file does not exist', () => {
    const settings = new Settings();
    fs.existsSync.mockReturnValueOnce(false);
    expect(settings.get().settings[0].cached).toEqual(false);
});

it('sets cached to true when cache_flag file exists', () => {
    const settings = new Settings();
    fs.existsSync.mockReturnValueOnce(true);
    expect(settings.get().settings[0].cached).toEqual(true);
});
