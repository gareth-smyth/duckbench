const RecommendedPartition = require('../../../src/plugins/RecommendedPartition');

it('returns RedirectInputFile as a dependency', () => {
    const partition = new RecommendedPartition();
    const config = partition.configure();

    expect(config).toEqual([{name: 'RedirectInputFile'}]);
});
