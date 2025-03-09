import AminetService  from '../../../src/services/AminetService.js';
vi.mock('../../../src/services/AminetService');

import Patch  from '../../../src/plugins/Patch/index.js';

it('downloads the patch archive', async () => {
    const patch = new Patch();
    await patch.prepare();

    expect(AminetService.download).toHaveBeenCalledTimes(1);
    expect(AminetService.download).toHaveBeenCalledWith('dev/misc/patch-2.1.lha');
});
