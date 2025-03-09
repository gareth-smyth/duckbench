import EnvironmentSetup  from '../../src/builder/EnvironmentSetup.js';
import Runner  from '../../src/builder/Runner.js';

const MockEnvironment = vi.fn();
const MockCommunicator = vi.fn();

vi.mock('../../src/plugins/Setup');
vi.mock('../../src/builder/Runner');
vi.mock('../../src/builder/EnvironmentSetup');

import DuckbenchBuilder  from '../../src/builder/DuckbenchBuilder.js';
import {MockedObject} from "vitest";

const mockEnvironmentSetupInstance = {
    destroy: vi.fn(),
} as unknown as EnvironmentSetup;

const mockRunnerInstance = {
    configureAndSetup: vi.fn(),
    validate: vi.fn(),
    prepare: vi.fn(),
    install: vi.fn(),
    finalise: vi.fn(),
} as unknown as MockedObject<Runner>;

const mockEnvironmentInstance = {
    start: vi.fn(),
    stop: vi.fn(),
    finalise: vi.fn(),
};

const mockCommunicatorInstance = {
    connect: vi.fn(),
    close: vi.fn(),
};

let duckbenchBuilder: DuckbenchBuilder;

beforeEach(() => {
    vi.resetAllMocks();
    MockEnvironment.mockImplementation(() => mockEnvironmentInstance);
    MockCommunicator.mockImplementation(() => mockCommunicatorInstance);
    vi.mocked(EnvironmentSetup).mockImplementation(() => mockEnvironmentSetupInstance);
    vi.mocked(Runner).mockImplementation(() => mockRunnerInstance);
    mockRunnerInstance.prepare.mockResolvedValue();
    mockRunnerInstance.finalise.mockResolvedValue();
    mockRunnerInstance.validate.mockReturnValue();
    duckbenchBuilder = new DuckbenchBuilder();
    duckbenchBuilder.sleep = () => Promise.resolve();
});

it('creates and destroys an environment setup .', async () => {
    await duckbenchBuilder.build([], MockEnvironment, MockCommunicator, 'settings');

    expect(EnvironmentSetup).toHaveBeenCalledTimes(1);
    expect(EnvironmentSetup).toHaveBeenCalledWith('settings');
    expect(mockEnvironmentSetupInstance.destroy).toHaveBeenCalledTimes(1);
    expect(mockEnvironmentSetupInstance.destroy).toHaveBeenCalledWith();
});

it('creates an environment with the proper config, starts it, and stops it.', async () => {
    await duckbenchBuilder.build([], MockEnvironment, MockCommunicator, 'settings');

    expect(MockEnvironment).toHaveBeenCalledTimes(1);
    expect(MockEnvironment).toHaveBeenCalledWith(mockEnvironmentSetupInstance, 'settings');
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

    expect(Runner).toHaveBeenCalledTimes(1);
    expect(Runner).toHaveBeenCalledWith();
    expect(mockRunnerInstance.configureAndSetup).toHaveBeenCalledTimes(1);
    expect(mockRunnerInstance.configureAndSetup).toHaveBeenCalledWith(
        {name: 'Setup'}, ['plugin_config1', 'plugin_config2'],
    );
    expect(mockRunnerInstance.prepare).toHaveBeenCalledTimes(1);
    expect(mockRunnerInstance.prepare).toHaveBeenCalledWith(mockEnvironmentSetupInstance, 'settings');
    expect(mockRunnerInstance.install).toHaveBeenCalledTimes(1);
    expect(mockRunnerInstance.install)
        .toHaveBeenCalledWith(mockCommunicatorInstance, mockEnvironmentSetupInstance, 'settings');
    expect(mockRunnerInstance.finalise).toHaveBeenCalledTimes(1);
    expect(mockRunnerInstance.finalise).toHaveBeenCalledWith(mockEnvironmentSetupInstance);
});

it('throws an exception when finalising the environment fails', async () => {
    mockRunnerInstance.finalise.mockImplementation(async () => {
        throw new Error('Some error');
    });

    return duckbenchBuilder.build(['plugin_config1'], MockEnvironment, MockCommunicator, 'settings').then(() => {
        fail('Should throw an exception');
    }).catch((err) => {
        expect(err.message).toEqual('Some error');
        expect(Runner).toHaveBeenCalledTimes(1);
        expect(Runner).toHaveBeenCalledWith();
        expect(mockRunnerInstance.configureAndSetup).toHaveBeenCalledTimes(1);
        expect(mockRunnerInstance.configureAndSetup).toHaveBeenCalledWith({name: 'Setup'}, ['plugin_config1']);
        expect(mockRunnerInstance.prepare).toHaveBeenCalledTimes(1);
        expect(mockRunnerInstance.prepare).toHaveBeenCalledWith(mockEnvironmentSetupInstance, 'settings');
        expect(mockRunnerInstance.install).toHaveBeenCalledTimes(1);
        expect(mockRunnerInstance.install)
            .toHaveBeenCalledWith(mockCommunicatorInstance, mockEnvironmentSetupInstance, 'settings');
        expect(mockRunnerInstance.finalise).toHaveBeenCalledTimes(1);
        expect(mockRunnerInstance.finalise).toHaveBeenCalledWith(mockEnvironmentSetupInstance);
    });
});

it('throws an exception when starting the environment fails', async () => {
    mockEnvironmentInstance.start.mockImplementation(() => {
        throw new Error('Some error');
    });

    return duckbenchBuilder.build([], MockEnvironment, MockCommunicator, 'settings').then(() => {
        fail('Should throw an exception');
    }).catch((err) => {
        expect(err.message).toEqual('Some error');
        expect(MockEnvironment).toHaveBeenCalledTimes(1);
        expect(MockEnvironment).toHaveBeenCalledWith(mockEnvironmentSetupInstance, 'settings');
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
        fail('Should throw an exception');
    }).catch((err) => {
        expect(err.message).toEqual('Some error');
        expect(MockEnvironment).toHaveBeenCalledTimes(1);
        expect(MockEnvironment).toHaveBeenCalledWith(mockEnvironmentSetupInstance, 'settings');
        expect(mockEnvironmentInstance.stop).toHaveBeenCalledTimes(0);
        expect(mockCommunicatorInstance.close).toHaveBeenCalledTimes(0);
    });
});
