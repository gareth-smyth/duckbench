import RecommendedPartition  from '../../../src/plugins/RecommendedPartition/index.js';

it('returns RedirectInputFile as a dependency', () => {
    const partition = new RecommendedPartition();
    const config = partition.configure();

    expect(config).toEqual([{name: 'RedirectInputFile'}]);
});
