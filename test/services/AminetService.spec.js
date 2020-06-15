const fs = require('fs');
const path = require('path');
const request = require('request-promise');

const AminetService = require('../../src/services/AminetService');

jest.mock('fs');
jest.mock('request');

it('does not download the file when it already exists', async () => {
    fs.existsSync.mockReturnValueOnce(true);

    await AminetService.download('net/path');

    expect(request).toHaveBeenCalledTimes(0);
    expect(fs.writeFileSync).toHaveBeenCalledTimes(0);
});

it('downloads the file when it does not exist', async () => {
    fs.existsSync.mockReturnValueOnce(false);
    request.mockResolvedValueOnce({body: 'myfile'});

    await AminetService.download('net/path/mydownload.file');

    expect(request).toHaveBeenCalledTimes(1);
    const expectedURI = 'http://aminet.net/net/path/mydownload.file';
    const expectedRequest = {encoding: null, resolveWithFullResponse: true, uri: expectedURI};
    expect(request).toHaveBeenCalledWith(expectedRequest);
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(global.CACHE_DIR, 'mydownload.file'), 'myfile');
});

it('overrides the filename when supplied', async () => {
    fs.existsSync.mockReturnValueOnce(false);
    request.mockResolvedValueOnce({body: 'myfile'});

    await AminetService.download('net/path/mydownload.file', 'myfilename.lha');

    expect(request).toHaveBeenCalledTimes(1);
    const expectedURI = 'http://aminet.net/net/path/mydownload.file';
    const expectedRequest = {encoding: null, resolveWithFullResponse: true, uri: expectedURI};
    expect(request).toHaveBeenCalledWith(expectedRequest);
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(global.CACHE_DIR, 'myfilename.lha'), 'myfile');
});

it('throws an error when downloading fails', async () => {
    fs.existsSync.mockReturnValueOnce(false);
    request.mockRejectedValue('request error');

    await expect(AminetService.download('net/path/mydownload.file')).rejects.toThrowError('request error');
});
