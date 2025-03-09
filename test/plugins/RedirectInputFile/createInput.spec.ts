import RedirectInputFile  from '../../../src/plugins/RedirectInputFile/index.js';

it('returns the default file location', async () => {
    const communicator = {echo: vi.fn()};
    const redirectInputFile = new RedirectInputFile();
    expect(await redirectInputFile.createInput(['a', 'b', 'c'], communicator, 'ram:temp_input')).toEqual('ram:temp_input');
});

it('returns the file location', async () => {
    const communicator = {echo: vi.fn()};
    const redirectInputFile = new RedirectInputFile();
    expect(await redirectInputFile.createInput(['a', 'b', 'c'], communicator, 'ram:RedirectInputFile.txt'))
        .toEqual('ram:RedirectInputFile.txt');
});

it('echos the output', async () => {
    const communicator = {echo: vi.fn()};
    const redirectInputFile = new RedirectInputFile();
    await redirectInputFile.createInput(['a', 'b', 'c'], communicator, 'ram:temp_input');
    expect(communicator.echo).toHaveBeenCalledWith('a*nb*nc*n', {'REDIRECT_OUT': 'ram:temp_input'});
});
