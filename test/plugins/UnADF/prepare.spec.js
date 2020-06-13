const fs = require('fs');
const path = require('path');
const request = require('request-promise');

const UnADF = require('../../../src/plugins/UnADF');

jest.mock('fs');
jest.mock('request');

it('does not download the unADF file when it already exists', async () => {
    fs.existsSync.mockReturnValueOnce(true);

    const unADF = new UnADF();
    await unADF.prepare({}, {executionFolder: 'aFolder'});

    expect(fs.writeFileSync).toHaveBeenCalledTimes(0);
});

it('downloads the unADF file when it does not exist', async () => {
    fs.existsSync.mockReturnValueOnce(false);
    request.mockResolvedValueOnce({body: 'myfile'});

    const unADF = new UnADF();
    await unADF.prepare({}, {executionFolder: 'aFolder'});

    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(global.CACHE_DIR, 'UnADF.lha'), 'myfile');
    expect(request).toHaveBeenCalledTimes(1);
    const expectedURI = 'http://aminet.net/disk/misc/UnADF.lha';
    const expectedRequest = {encoding: null, resolveWithFullResponse: true, uri: expectedURI};
    expect(request).toHaveBeenCalledWith(expectedRequest);
});

it('throws an error when downloading fails', async () => {
    fs.existsSync.mockReturnValueOnce(false);
    request.mockRejectedValue('request error');

    const unADF = new UnADF();
    await expect(unADF.prepare({}, {executionFolder: 'aFolder'})).rejects.toThrowError('request error');
});
