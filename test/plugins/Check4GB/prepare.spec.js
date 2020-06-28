const AminetService = require('../../../src/services/AminetService');
jest.mock('../../../src/services/AminetService');

const Check4GB = require('../../../src/plugins/Check4GB');

it('downloads the check4GB archive', async () => {
    const check4GB = new Check4GB();
    await check4GB.prepare();

    expect(AminetService.download).toHaveBeenCalledTimes(1);
    expect(AminetService.download).toHaveBeenCalledWith('disk/misc/check4gb.lha');
});
