const Check4GB = require('../../../src/plugins/Check4GB');

it('returns Lha as a dependency', () => {
    const check4GB = new Check4GB();
    const config = check4GB.configure();

    expect(config).toEqual([{name: 'Lha', optionValues: {location: 'duckbench:c/'}}]);
});
