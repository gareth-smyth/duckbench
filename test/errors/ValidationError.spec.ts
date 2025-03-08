import ValidationError from '../../src/errors/ValidationError';

it('creates an error', () => {
    const validationError = new ValidationError('some thing');
    expect(validationError.validationErrors).toEqual('some thing');
});

