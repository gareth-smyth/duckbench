const fs = require('fs');
const path = require('path');
const request = require('request-promise');

const Lha = require('../../../src/plugins/Lha');

jest.mock('fs');
jest.mock('request');

beforeEach(() => {
    fs.existsSync.mockReset();
    fs.writeFileSync.mockReset();
    request.mockReset();
});

it('does not download the lha.run file when it already exists', async () => {
    fs.existsSync.mockReturnValueOnce(true);

    const lha = new Lha();
    await lha.prepare();

    expect(fs.writeFileSync).toHaveBeenCalledTimes(0);
});

it('downloads the lha.run file when it does not exist', async () => {
    fs.existsSync.mockReturnValueOnce(false);
    request.mockResolvedValue({body: 'myfile'});

    const lha = new Lha();
    await lha.prepare();

    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(global.TOOLS_DIR, 'lha.run'), 'myfile');
    expect(request).toHaveBeenCalledTimes(1);
    const expectedUri = 'http://aminet.net/util/arc/lha.run';
    expect(request).toHaveBeenCalledWith({encoding: null, resolveWithFullResponse: true, uri: expectedUri});
});

it('throws an error when downloading fails', async () => {
    fs.existsSync.mockReturnValueOnce(false);
    request.mockRejectedValue('an_error');

    const lha = new Lha();

    await expect(lha.prepare()).rejects.toThrow();
    expect(fs.writeFileSync).toHaveBeenCalledTimes(0);
});