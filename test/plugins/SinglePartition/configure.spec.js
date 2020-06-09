const SinglePartition = require('../../../src/plugins/SinglePartition');

it('returns HitEnterFile as a dependency', () => {
    const partition = new SinglePartition();
    const config = partition.configure();

    expect(config).toEqual([{name: 'HitEnterFile'}]);
});
