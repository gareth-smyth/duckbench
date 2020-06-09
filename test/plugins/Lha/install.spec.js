const Lha = require('../../../src/plugins/Lha');

it('calls the communicator to install lha once in each location requested', async () => {
    const communicator = {run: jest.fn()};

    const lha = new Lha();
    await lha.install({optionValues: {location: 'A:'}}, communicator);
    await lha.install({optionValues: {location: 'A:'}}, communicator);
    await lha.install({optionValues: {location: 'B:'}}, communicator);

    const command = communicator.run;
    expect(command).toHaveBeenCalledTimes(2);
    expect(command).toHaveBeenCalledWith('DB_TOOLS:lha.run -x A:', {}, undefined, 'Extracting: lha_68k');
    expect(command).toHaveBeenCalledWith('DB_TOOLS:lha.run -x B:', {}, undefined, 'Extracting: lha_68k');
});

it('throws an error when send command rejects', async () => {
    const communicator = {run: jest.fn()};
    communicator.run.mockImplementation(() => {
        throw new Error('lha.run error');
    });

    const lha = new Lha();

    await expect(lha.install({optionValues: {location: 'A:'}}, communicator)).rejects.toThrowError('lha.run error');
});
