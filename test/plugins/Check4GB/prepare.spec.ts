import AminetService  from '../../../src/services/AminetService.js';
vi.mock('../../../src/services/AminetService');

import Check4GB  from '../../../src/plugins/Check4GB/index.js';

it('downloads the check4GB archive', async () => {
    const check4GB = new Check4GB();
    await check4GB.prepare();

    expect(AminetService.download).toHaveBeenCalledTimes(1);
    expect(AminetService.download).toHaveBeenCalledWith('disk/misc/check4gb.lha');
});
