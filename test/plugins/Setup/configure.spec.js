const Setup = require('../../../src/plugins/Setup');

it('returns HitEnterFile as a dependency', () => {
    const setup = new Setup();
    const config = setup.configure();

    expect(config).toEqual([{name: 'HitEnterFile'}]);
});
