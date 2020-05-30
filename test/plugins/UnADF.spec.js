const fs = require('fs');
const request = require('request-promise');

const UnADF = require('../../src/plugins/UnADF');

jest.mock('fs');
jest.mock('request');

beforeEach(() => {
    fs.existsSync.mockReset();
    fs.writeFileSync.mockReset();
    request.mockReset();
});

it('returns Lha as a dependency', () => {
    const unADF = new UnADF();
    const config = unADF.configure();

    expect(config).toEqual([{name: 'Lha', optionValues: {location: 'duckbench:c/'}}]);
});

describe('install', () => {
    it('calls the communicator to install unADF once in each location requested, and unpacks once', async () => {
        const communicator = {sendCommand: jest.fn()};
        communicator.sendCommand
            .mockResolvedValueOnce(['something something', 'Operation successful.'])
            .mockResolvedValueOnce('')
            .mockResolvedValue('');

        const unADF = new UnADF();
        await unADF.install({
            optionValues: {
                location: 'A:', sourceDir: 'aDir:', sourceFile: 'aFile', dest: 'wb:',
            },
        }, communicator);
        await unADF.install({
            optionValues: {
                location: 'A:', sourceDir: 'aDir:', sourceFile: 'aFile', dest: 'wb:',
            },
        }, communicator);
        await unADF.install({
            optionValues: {
                location: 'B:', sourceDir: 'bDir:', sourceFile: 'bFile', dest: 'work:',
            },
        }, communicator);

        expect(communicator.sendCommand).toHaveBeenCalledTimes(1);
        expect(communicator.sendCommand).toHaveBeenCalledWith('lha_68k x DB_TOOLS:UnADF.lha A:');
    });

    it('throws an error when extraction rejects', async () => {
        const communicator = {sendCommand: jest.fn()};
        communicator.sendCommand.mockRejectedValue('error');

        const unADF = new UnADF();
        await expect(unADF.install({
            optionValues: {
                location: 'A:', sourceDir: 'aDir:', sourceFile: 'aFile', dest: 'wb:',
            },
        }, communicator)).rejects.toThrow();
    });

    it('throws an error when extraction returns an unexpected response', async () => {
        const communicator = {sendCommand: jest.fn()};
        communicator.sendCommand.mockResolvedValue(['some value']);

        const unADF = new UnADF();
        await expect(unADF.install({
            optionValues: {
                location: 'A:', sourceDir: 'aDir:', sourceFile: 'aFile', dest: 'wb:',
            },
        }, communicator)).rejects.toThrow();
    });
});

describe('prepare', () => {
    it('does not download the unADF file when it already exists', async () => {
        fs.existsSync.mockReturnValueOnce(true);

        const unADF = new UnADF();
        await unADF.prepare();

        expect(fs.writeFileSync).toHaveBeenCalledTimes(0);
    });

    it('downloads the unADF file when it does not exist', async () => {
        fs.existsSync.mockReturnValueOnce(false);
        request.mockResolvedValueOnce({body: 'myfile'});

        const unADF = new UnADF();
        await unADF.prepare();

        expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
        expect(fs.writeFileSync).toHaveBeenCalledWith('./external_tools/UnADF.lha', 'myfile');
        expect(request).toHaveBeenCalledTimes(1);
        const expectedURI = 'http://aminet.net/disk/misc/UnADF.lha';
        const expectedRequest = {encoding: null, resolveWithFullResponse: true, uri: expectedURI};
        expect(request).toHaveBeenCalledWith(expectedRequest);
    });

    it('throws an error when downloading fails', async () => {
        fs.existsSync.mockReturnValueOnce(false);
        request.mockRejectedValue('error');

        const unADF = new UnADF();
        await expect(unADF.prepare()).rejects.toThrow();
    });
});

describe('run', () => {
    describe('when successful', ()=> {
        const communicator = {sendCommand: jest.fn()};
        beforeEach(() => {
            communicator.sendCommand
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce(['Saved 10 files'])
                .mockResolvedValueOnce(['duckbench:file.adf  Deleted']);
        });

        it('copies the source file to the duckbench drive', async ()=> {
            const unADF = new UnADF();
            await unADF.run('a:', 'file.adf', 'b:disks/', 'somewhere:', communicator);

            expect(communicator.sendCommand).toHaveBeenCalledWith('copy a:file.adf duckbench:');
        });

        it('changes directory to the unADF folder', async ()=> {
            const unADF = new UnADF();
            await unADF.run('a:', 'file.adf', 'b:disks/', 'somewhere:', communicator);

            expect(communicator.sendCommand).toHaveBeenCalledWith('cd somewhere:UnADF');
        });

        it('extracts the ADF to the requested folder', async ()=> {
            const unADF = new UnADF();
            await unADF.run('a:', 'file.adf', 'b:disks/', 'somewhere:', communicator);

            expect(communicator.sendCommand).toHaveBeenCalledWith('unadf duckbench:file.adf DEST=b:disks/');
        });

        it('deletes the temp ADF', async ()=> {
            const unADF = new UnADF();
            await unADF.run('a:', 'file.adf', 'b:disks/', 'somewhere:', communicator);

            expect(communicator.sendCommand).toHaveBeenCalledWith('delete duckbench:file.adf');
        });
    });

    it('throws an error when the copy command throws an error', async () => {
        const communicator = {sendCommand: jest.fn()};
        communicator.sendCommand
            .mockRejectedValueOnce('error');

        const unADF = new UnADF();
        await expect(
            unADF.run('a:', 'file.adf', 'b:disks/', 'somewhere:', communicator),
        ).rejects.toThrow();
    });

    it('throws an error when the copy command returns an unexpected response', async () => {
        const communicator = {sendCommand: jest.fn()};
        communicator.sendCommand
            .mockResolvedValueOnce(['error']);

        const unADF = new UnADF();
        await expect(
            unADF.run('a:', 'file.adf', 'b:disks/', 'somewhere:', communicator),
        ).rejects.toThrow();
    });

    it('throws an error when the cd command throws an error', async () => {
        const communicator = {sendCommand: jest.fn()};
        communicator.sendCommand
            .mockResolvedValueOnce([])
            .mockRejectedValueOnce('error');

        const unADF = new UnADF();
        await expect(
            unADF.run('a:', 'file.adf', 'b:disks/', 'somewhere:', communicator),
        ).rejects.toThrow();
    });

    it('throws an error when the cd command returns an unexpected response', async () => {
        const communicator = {sendCommand: jest.fn()};
        communicator.sendCommand
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce(['error']);

        const unADF = new UnADF();
        await expect(
            unADF.run('a:', 'file.adf', 'b:disks/', 'somewhere:', communicator),
        ).rejects.toThrow();
    });

    it('throws an error when the unADF command throws an error', async () => {
        const communicator = {sendCommand: jest.fn()};
        communicator.sendCommand
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockRejectedValueOnce('error');

        const unADF = new UnADF();
        await expect(
            unADF.run('a:', 'file.adf', 'b:disks/', 'somewhere:', communicator),
        ).rejects.toThrow();
    });

    it('throws an error when the unADF command returns an unexpected response', async () => {
        const communicator = {sendCommand: jest.fn()};
        communicator.sendCommand
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce(['error']);

        const unADF = new UnADF();
        await expect(
            unADF.run('a:', 'file.adf', 'b:disks/', 'somewhere:', communicator),
        ).rejects.toThrow();
    });

    it('throws an error when the delete command throws an error', async () => {
        const communicator = {sendCommand: jest.fn()};
        communicator.sendCommand
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce(['Saved 10 files'])
            .mockRejectedValueOnce('error');

        const unADF = new UnADF();
        await expect(
            unADF.run('a:', 'file.adf', 'b:disks/', 'somewhere:', communicator),
        ).rejects.toThrow();
    });

    it('throws an error when the delete command returns an unexpected response', async () => {
        const communicator = {sendCommand: jest.fn()};
        communicator.sendCommand
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce(['Saved 10 files'])
            .mockResolvedValueOnce(['error']);

        const unADF = new UnADF();
        await expect(
            unADF.run('a:', 'file.adf', 'b:disks/', 'somewhere:', communicator),
        ).rejects.toThrow();
    });
});
