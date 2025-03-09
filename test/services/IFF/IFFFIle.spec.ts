import IFFFIle  from '../../../src/services/IFF/IFFFile.js';
import {HIRES_LACED}  from '../../../src/services/prefs/ScreenMode.js';
import fs from 'fs';
import IFFWrapperChunk  from '../../../src/services/IFF/IFFWrapperChunk.js';

afterAll(() => {
    fs.unlinkSync('./test/services/IFF/testfile-test.iff');
});

it('reads a file correctly', () => {
    const file = IFFFIle.read('./test/services/IFF/testfile.iff') as IFFWrapperChunk;
    expect(file.type).toEqual('FORM');
    expect(file.groupType).toEqual('PREF');
    expect(file.children[0].type).toEqual('PRHD');
    expect(file.children[1].type).toEqual('SCRM');
    expect(file.children[1].data.slice(16, 20).readUInt32BE()).toEqual(HIRES_LACED);
    expect(file.children[1].data.slice(24, 26).readUInt16BE()).toEqual(4);
});

it('writes a file correctly', () => {
    const file = IFFFIle.read('./test/services/IFF/testfile.iff');
    IFFFIle.write('./test/services/IFF/testfile-test.iff', file);
    const writtenFile = IFFFIle.read('./test/services/IFF/testfile-test.iff') as IFFWrapperChunk;
    expect(writtenFile.type).toEqual('FORM');
    expect(writtenFile.groupType).toEqual('PREF');
    expect(writtenFile.children[0].type).toEqual('PRHD');
    expect(writtenFile.children[1].type).toEqual('SCRM');
    expect(writtenFile.children[1].data.slice(16, 20).readUInt32BE()).toEqual(HIRES_LACED);
    expect(writtenFile.children[1].data.slice(24, 26).readUInt16BE()).toEqual(4);
});
