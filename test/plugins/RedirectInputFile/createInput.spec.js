const RedirectInputFile = require('../../../src/plugins/RedirectInputFile');

it('returns the default file location', async () => {
    const communicator = {echo: jest.fn()};
    const redirectInputFile = new RedirectInputFile();
    expect(await redirectInputFile.createInput(['a', 'b', 'c'], communicator)).toEqual('ram:tmpinput');
});

it('returns the file location', async () => {
    const communicator = {echo: jest.fn()};
    const redirectInputFile = new RedirectInputFile();
    expect(await redirectInputFile.createInput(['a', 'b', 'c'], communicator, 'ram:RedirectInputFile.txt'))
        .toEqual('ram:RedirectInputFile.txt');
});

it('echos the output', async () => {
    const communicator = {echo: jest.fn()};
    const redirectInputFile = new RedirectInputFile();
    await redirectInputFile.createInput(['a', 'b', 'c'], communicator);
    expect(communicator.echo).toHaveBeenCalledWith('a*nb*nc*n', {'REDIRECT_OUT': 'ram:tmpinput'});
});
