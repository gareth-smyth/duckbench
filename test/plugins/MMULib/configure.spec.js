const MMULib = require('../../../src/plugins/MMULib');

it('returns Lha as a dependency', () => {
    const mmuLib = new MMULib();
    const config = mmuLib.configure();

    expect(config).toEqual([
        {name: 'InstallerLG', optionValues: {location: 'duckbench:c/'}},
        {name: 'Lha', optionValues: {location: 'duckbench:c/'}},
    ]);
});
