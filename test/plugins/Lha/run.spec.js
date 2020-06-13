const Lha = require('../../../src/plugins/Lha');

const communicator = {run: jest.fn()};
const callback = 'aCallback';
const options = 'options';

it('runs the lha command', async ()=> {
    const lha = new Lha();
    await lha.run('source', 'dest', 'lhaloc:', options, communicator, callback);

    expect(communicator.run)
        .toHaveBeenCalledWith('lhaloc:lha_68k x source dest', options, callback, 'Operation successful.');
});

it('throws an error when the installerLG command throws an error', async () => {
    communicator.run.mockImplementation(() => {
        throw new Error('lha error');
    });

    const lha = new Lha();
    await expect(lha.run('source', 'dest', 'lhaloc:', options, communicator, callback))
        .rejects.toThrowError('lha error');
});
