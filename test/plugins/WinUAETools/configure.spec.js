const WinUAETools = require('../../../src/plugins/WinUAETools');

it('returns RedirectInputFile as a dependency', () => {
    const patch = new WinUAETools();
    const config = patch.configure();

    expect(config).toEqual([{name: 'RedirectInputFile'}]);
});
