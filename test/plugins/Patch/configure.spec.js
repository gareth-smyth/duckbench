const Patch = require('../../../src/plugins/Patch');

it('returns Lha as a dependency', () => {
    const patch = new Patch();
    const config = patch.configure();

    expect(config).toEqual([{name: 'Lha', optionValues: {location: 'duckbench:c/'}}]);
});
