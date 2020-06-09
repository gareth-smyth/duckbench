const HitEnterFile = require('../../../src/plugins/HitEnterFile');

it('returns the file location', () => {
    const hitEnterFile = new HitEnterFile();
    expect(hitEnterFile.getFile()).toEqual('ram:HitEnterFile.txt');
});
