const Patch = require('../../../src/plugins/Patch');

const communicator = {run: jest.fn()};
const callback = 'aCallback';
const options = 'options';

beforeEach(() => {
    communicator.run.mockReset();
});

it('runs the patch command', async ()=> {
    const patch = new Patch();
    await patch.run('A', 'B', 'C:', options, communicator, callback, ['some response']);

    expect(communicator.run)
        .toHaveBeenCalledWith('C:patch A B', options, callback, ['some response']);
});

it('defaults the expected response when not supplied', async ()=> {
    const patch = new Patch();
    await patch.run('A', 'B', 'C:', options, communicator, callback);

    expect(communicator.run)
        .toHaveBeenCalledWith('C:patch A B', options, callback, ['succeeded', 'done']);
});

it('throws an error when the patch command throws an error', async () => {
    communicator.run.mockImplementation(() => {
        throw new Error('patch error');
    });

    const patch = new Patch();
    await expect(patch.run('A', 'B', 'C:', options, communicator, callback)).rejects.toThrowError('patch error');
});
