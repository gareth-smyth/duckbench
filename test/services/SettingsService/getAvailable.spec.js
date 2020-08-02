const SettingsService = require('../../../src/services/SettingsService');

it('returns settings for all plugins', async () => {
    const settings = (await SettingsService.getAvailable()).sort((a, b) => a.name.localeCompare(b.name));
    expect(settings.length).toBeGreaterThan(0);
    expect(settings[0].name).toEqual('Setup');
    expect(settings[0].settings[0].name).toEqual('emulatorRoot');
});
