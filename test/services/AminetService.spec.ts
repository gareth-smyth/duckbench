import fs from 'fs';
vi.mock('fs');
const mockedFs = fs as MockedObject<typeof fs>;
import path from 'path';
import request from 'request-promise';
vi.mock('request-promise');

import AminetService  from '../../src/services/AminetService.js';
import {MockedObject} from "vitest";


it('does not download the file when it already exists', async () => {
    mockedFs.existsSync.mockReturnValueOnce(true);

    await AminetService.download('net/path');

    expect(request).toHaveBeenCalledTimes(0);
    expect(fs.writeFileSync).toHaveBeenCalledTimes(0);
});

it('downloads the file when it does not exist', async () => {
    mockedFs.existsSync.mockReturnValueOnce(false);
    vi.mocked(request).mockResolvedValueOnce({body: 'myfile'});

    await AminetService.download('net/path/mydownload.file');

    expect(request).toHaveBeenCalledTimes(1);
    const expectedURI = 'http://aminet.net/net/path/mydownload.file';
    const expectedRequest = {encoding: null, resolveWithFullResponse: true, uri: expectedURI};
    expect(request).toHaveBeenCalledWith(expectedRequest);
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(global.CACHE_DIR, 'mydownload.file'), 'myfile');
});

it('overrides the filename when supplied', async () => {
    mockedFs.existsSync.mockReturnValueOnce(false);
    vi.mocked(request).mockResolvedValueOnce({body: 'myfile'});

    await AminetService.download('net/path/mydownload.file', 'myfilename.lha');

    expect(request).toHaveBeenCalledTimes(1);
    const expectedURI = 'http://aminet.net/net/path/mydownload.file';
    const expectedRequest = {encoding: null, resolveWithFullResponse: true, uri: expectedURI};
    expect(request).toHaveBeenCalledWith(expectedRequest);
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(global.CACHE_DIR, 'myfilename.lha'), 'myfile');
});

it('throws an error when downloading fails', async () => {
    mockedFs.existsSync.mockReturnValueOnce(false);
    vi.mocked(request).mockRejectedValue('request error');

    await expect(AminetService.download('net/path/mydownload.file')).rejects.toThrow('request error');
});
