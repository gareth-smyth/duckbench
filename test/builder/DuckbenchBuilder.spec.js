const MockEnvironment = jest.fn();
const MockCommunicator = jest.fn();
const MockEnvironmentSetup = jest.fn();
const MockRunner = jest.fn();

jest.mock('../../src/plugins/Setup');
jest.mock('../../src/builder/Runner', () => MockRunner);
jest.mock('../../src/builder/duckbench.config', () => 'mock_config');
jest.doMock('../../src/builder/EnvironmentSetup', () => MockEnvironmentSetup);

const DuckbenchBuilder = require('../../src/builder/DuckbenchBuilder');

const mockEnvironmentSetupInstance = {
    destroy: jest.fn(),
};

const mockRunnerInstance = {
    configureAndSetup: jest.fn(),
    prepare: jest.fn(),
    install: jest.fn(),
    finalise: jest.fn(),
};

const mockEnvironmentInstance = {
    start: jest.fn(),
    stop: jest.fn(),
    finalise: jest.fn(),
};

const mockCommunicatorInstance = {
    connect: jest.fn(),
    close: jest.fn(),
};

let duckbenchBuilder;

beforeEach(() => {
    jest.resetAllMocks();
    MockEnvironment.mockImplementation(() => mockEnvironmentInstance);
    MockCommunicator.mockImplementation(() => mockCommunicatorInstance);
    MockEnvironmentSetup.mockImplementation(() => mockEnvironmentSetupInstance);
    MockRunner.mockImplementation(() => mockRunnerInstance);
    mockRunnerInstance.prepare.mockResolvedValue({});
    mockRunnerInstance.finalise.mockResolvedValue({});
    duckbenchBuilder = new DuckbenchBuilder();
    duckbenchBuilder.sleep = () => Promise.resolve();
});

it('creates and destroys an environment setup .', async () => {
    await duckbenchBuilder.build([], MockEnvironment, MockCommunicator, 'settings');

    expect(MockEnvironmentSetup).toHaveBeenCalledTimes(1);
    expect(MockEnvironmentSetup).toHaveBeenCalledWith('mock_config');
    expect(mockEnvironmentSetupInstance.destroy).toHaveBeenCalledTimes(1);
    expect(mockEnvironmentSetupInstance.destroy).toHaveBeenCalledWith();
});

it('creates an environment with the proper config, starts it, and stops it.', async () => {
    await duckbenchBuilder.build([], MockEnvironment, MockCommunicator, 'settings');

    expect(MockEnvironment).toHaveBeenCalledTimes(1);
    expect(MockEnvironment).toHaveBeenCalledWith('mock_config', mockEnvironmentSetupInstance, 'settings');
    expect(mockEnvironmentInstance.start).toHaveBeenCalledTimes(1);
    expect(mockEnvironmentInstance.start).toHaveBeenCalledWith();
    expect(mockEnvironmentInstance.stop).toHaveBeenCalledTimes(2);
    expect(mockEnvironmentInstance.stop).toHaveBeenCalledWith();
});

it('creates a communicator, connects to it and closes it', async () => {
    await duckbenchBuilder.build([], MockEnvironment, MockCommunicator, 'settings');

    expect(mockCommunicatorInstance.connect).toHaveBeenCalledTimes(1);
    expect(mockCommunicatorInstance.connect).toHaveBeenCalledWith();
    expect(mockCommunicatorInstance.close).toHaveBeenCalledTimes(2);
    expect(mockCommunicatorInstance.close).toHaveBeenCalledWith();
});

it('creates a runner, configures, prepares, installs and finalises', async () => {
    await duckbenchBuilder.build(['plugin_config1', 'plugin_config2'], MockEnvironment, MockCommunicator, 'settings');

    expect(MockRunner).toHaveBeenCalledTimes(1);
    expect(MockRunner).toHaveBeenCalledWith('mock_config');
    expect(mockRunnerInstance.configureAndSetup).toHaveBeenCalledTimes(1);
    expect(mockRunnerInstance.configureAndSetup).toHaveBeenCalledWith(
        {name: 'Setup'}, ['plugin_config1', 'plugin_config2'],
    );
    expect(mockRunnerInstance.prepare).toHaveBeenCalledTimes(1);
    expect(mockRunnerInstance.prepare).toHaveBeenCalledWith(mockEnvironmentSetupInstance, 'settings');
    expect(mockRunnerInstance.install).toHaveBeenCalledTimes(1);
    expect(mockRunnerInstance.install).toHaveBeenCalledWith(mockCommunicatorInstance, mockEnvironmentSetupInstance);
    expect(mockRunnerInstance.finalise).toHaveBeenCalledTimes(1);
    expect(mockRunnerInstance.finalise).toHaveBeenCalledWith(mockEnvironmentSetupInstance);
});

it('throws an exception when finalising the environment fails', async () => {
    mockRunnerInstance.finalise.mockImplementation(async () => {
        throw new Error('Some error');
    });

    return duckbenchBuilder.build(['plugin_config1'], MockEnvironment, MockCommunicator, 'settings').then(() => {
        jest.fail('Should throw an exception');
    }).catch((err) => {
        expect(err.message).toEqual('Some error');
        expect(MockRunner).toHaveBeenCalledTimes(1);
        expect(MockRunner).toHaveBeenCalledWith('mock_config');
        expect(mockRunnerInstance.configureAndSetup).toHaveBeenCalledTimes(1);
        expect(mockRunnerInstance.configureAndSetup).toHaveBeenCalledWith({name: 'Setup'}, ['plugin_config1']);
        expect(mockRunnerInstance.prepare).toHaveBeenCalledTimes(1);
        expect(mockRunnerInstance.prepare).toHaveBeenCalledWith(mockEnvironmentSetupInstance, 'settings');
        expect(mockRunnerInstance.install).toHaveBeenCalledTimes(1);
        expect(mockRunnerInstance.install).toHaveBeenCalledWith(mockCommunicatorInstance, mockEnvironmentSetupInstance);
        expect(mockRunnerInstance.finalise).toHaveBeenCalledTimes(1);
        expect(mockRunnerInstance.finalise).toHaveBeenCalledWith(mockEnvironmentSetupInstance);
    });
});

it('throws an exception when starting the environment fails', async () => {
    mockEnvironmentInstance.start.mockImplementation(() => {
        throw new Error('Some error');
    });

    return duckbenchBuilder.build([], MockEnvironment, MockCommunicator, 'settings').then(() => {
        jest.fail('Should throw an exception');
    }).catch((err) => {
        expect(err.message).toEqual('Some error');
        expect(MockEnvironment).toHaveBeenCalledTimes(1);
        expect(MockEnvironment).toHaveBeenCalledWith('mock_config', mockEnvironmentSetupInstance, 'settings');
        expect(mockEnvironmentInstance.start).toHaveBeenCalledTimes(1);
        expect(mockEnvironmentInstance.start).toHaveBeenCalledWith();
        expect(mockEnvironmentInstance.stop).toHaveBeenCalledTimes(1);
        expect(mockEnvironmentInstance.stop).toHaveBeenCalledWith();
        expect(mockCommunicatorInstance.close).toHaveBeenCalledTimes(0);
    });
});

it('throws an exception when creating the environment fails', async () => {
    MockEnvironment.mockImplementation(() => {
        throw new Error('Some error');
    });

    return duckbenchBuilder.build([], MockEnvironment, MockCommunicator, 'settings').then(() => {
        jest.fail('Should throw an exception');
    }).catch((err) => {
        expect(err.message).toEqual('Some error');
        expect(MockEnvironment).toHaveBeenCalledTimes(1);
        expect(MockEnvironment).toHaveBeenCalledWith('mock_config', mockEnvironmentSetupInstance, 'settings');
        expect(mockEnvironmentInstance.stop).toHaveBeenCalledTimes(0);
        expect(mockCommunicatorInstance.close).toHaveBeenCalledTimes(0);
    });
});
