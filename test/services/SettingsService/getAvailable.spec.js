const SettingsService = require('../../../src/services/SettingsService');

it('returns settings for all plugins', async () => {
    const settings = (await SettingsService.getAvailable()).sort((a, b) => a.name.localeCompare(b.name));
    expect(settings.length).toBeGreaterThan(0);
    const Setup = settings.find((plugin) => plugin.name === 'Setup');
    expect(Setup.label).toEqual('Setup');
    expect(Setup.settings[0].name).toEqual('emulatorRoot');
});
