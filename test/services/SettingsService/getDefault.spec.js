const SettingsService = require('../../../src/services/SettingsService');

it('returns the default value for the setting and plugin', async () => {
    process.env.DUCKBENCH_EMU = 'Some place';
    const defaultValue = await SettingsService.getDefault('Setup', 'emulatorRoot');
    expect(defaultValue).toEqual({value: {folder: 'Some place'}});
});

it('does not call default if it does not exist for the plugin', async () => {
    const defaultValue = await SettingsService.getDefault('InstallWorkbench390', 'isoLocation');
    expect(defaultValue).toEqual(undefined);
});
