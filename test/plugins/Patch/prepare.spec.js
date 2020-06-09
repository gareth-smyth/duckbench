const fs = require('fs');
const path = require('path');
const request = require('request-promise');

const Patch = require('../../../src/plugins/Patch');

jest.mock('fs');
jest.mock('request');

beforeEach(() => {
    fs.existsSync.mockReset();
    fs.writeFileSync.mockReset();
    request.mockReset();
});

it('does not download the patch file when it already exists', async () => {
    fs.existsSync.mockReturnValueOnce(true);

    const patch = new Patch();
    await patch.prepare();

    expect(fs.writeFileSync).toHaveBeenCalledTimes(0);
});

it('downloads the patch file when it does not exist', async () => {
    fs.existsSync.mockReturnValueOnce(false);
    request.mockResolvedValueOnce({body: 'myfile'});

    const patch = new Patch();
    await patch.prepare();

    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(global.TOOLS_DIR, 'patch-2.1.lha'), 'myfile');
    expect(request).toHaveBeenCalledTimes(1);
    const expectedUri = 'http://aminet.net/dev/misc/patch-2.1.lha';
    expect(request).toHaveBeenCalledWith({encoding: null, resolveWithFullResponse: true, uri: expectedUri});
});

it('throws an error when downloading fails', async () => {
    fs.existsSync.mockReturnValueOnce(false);
    request.mockRejectedValue('request error');

    const patch = new Patch();
    await expect(patch.prepare()).rejects.toThrowError('request error');
});
