const RecommendedPartition = require('../../../src/plugins/RecommendedPartition');

it('returns HitEnterFile as a dependency', () => {
    const partition = new RecommendedPartition();
    const config = partition.configure();

    expect(config).toEqual([{name: 'HitEnterFile'}]);
});
