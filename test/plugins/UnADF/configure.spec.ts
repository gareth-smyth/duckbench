import UnADF  from '../../../src/plugins/UnADF/index.js';

it('returns Lha as a dependency', () => {
    const unADF = new UnADF();
    const config = unADF.configure();

    expect(config).toEqual([{name: 'Lha', optionValues: {location: 'duckbench:c/'}}]);
});
