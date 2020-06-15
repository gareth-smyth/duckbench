const AminetService = require('../../../src/services/AminetService');
jest.mock('../../../src/services/AminetService');

const Lha = require('../../../src/plugins/Lha');

it('downloads the lha.run file', async () => {
    const lha = new Lha();
    await lha.prepare();

    expect(AminetService.download).toHaveBeenCalledTimes(1);
    expect(AminetService.download).toHaveBeenCalledWith('util/arc/lha.run');
});
