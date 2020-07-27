const SysInfo = require('../../../src/plugins/SysInfo');

it('returns Lha as a dependency', () => {
    const sysInfo = new SysInfo();
    const config = sysInfo.configure();

    expect(config).toEqual([{name: 'Lha', optionValues: {location: 'duckbench:c/'}}]);
});
