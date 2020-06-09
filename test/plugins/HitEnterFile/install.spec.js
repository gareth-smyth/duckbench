const HitEnterFile = require('../../../src/plugins/HitEnterFile');

it('calls the communicator to write the file to ram:', async () => {
    const communicator = {echo: jest.fn()};
    communicator.echo.mockResolvedValue('');

    const hitEnterFile = new HitEnterFile();
    await hitEnterFile.install({}, communicator);
    await hitEnterFile.install({}, communicator);

    expect(communicator.echo).toHaveBeenCalledTimes(1);
    expect(communicator.echo).toHaveBeenCalledWith('\\n', {REDIRECT_OUT: 'ram:HitEnterFile.txt'});
});

it('throws an error when writing the file rejects', async () => {
    const communicator = {echo: jest.fn()};
    communicator.echo.mockImplementation(() => {
        throw new Error('echo error');
    });

    const hitEnterFile = new HitEnterFile();
    await expect(hitEnterFile.install({}, communicator)).rejects.toThrowError('echo error');
});
