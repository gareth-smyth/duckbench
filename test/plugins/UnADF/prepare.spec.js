const AminetService = require('../../../src/services/AminetService');
jest.mock('../../../src/services/AminetService');

const UnADF = require('../../../src/plugins/UnADF');

it('downloads the patch archive', async () => {
    const unADF = new UnADF();
    await unADF.prepare();

    expect(AminetService.download).toHaveBeenCalledTimes(1);
    expect(AminetService.download).toHaveBeenCalledWith('disk/misc/UnADF.lha');
});
