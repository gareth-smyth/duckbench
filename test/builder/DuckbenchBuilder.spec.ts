import EnvironmentSetup  from '../../src/builder/EnvironmentSetup';
import Runner  from '../../src/builder/Runner';

vi.mock('../../src/plugins/Setup');
vi.mock('../../src/builder/Runner');
vi.mock('../../src/builder/EnvironmentSetup');
vi.mock('../../src/builder/WinUAEEnvironment');
vi.mock('../../src/builder/Communicator');

import DuckbenchBuilder, {PluginConfig} from '../../src/builder/DuckbenchBuilder';
import {MockedObject} from "vitest";
import WinUAEEnvironment from "../../src/builder/WinUAEEnvironment";
import Communicator from "../../src/builder/Communicator";

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
} as unknown as MockedObject<WinUAEEnvironment>;

const mockCommunicatorInstance = {
    connect: vi.fn(),
    close: vi.fn(),
} as unknown as MockedObject<Communicator>;

let duckbenchBuilder: DuckbenchBuilder;

beforeEach(() => {
    vi.mocked(WinUAEEnvironment).mockImplementation(() => mockEnvironmentInstance);
    vi.mocked(Communicator).mockImplementation(() => mockCommunicatorInstance);
    vi.mocked(EnvironmentSetup).mockImplementation(() => mockEnvironmentSetupInstance);
    vi.mocked(Runner).mockImplementation(() => mockRunnerInstance);
    mockRunnerInstance.prepare.mockResolvedValue();
    mockRunnerInstance.finalise.mockResolvedValue();
    mockRunnerInstance.validate.mockReturnValue();
    duckbenchBuilder = new DuckbenchBuilder();
    duckbenchBuilder.sleep = () => Promise.resolve();
});

it('creates and destroys an environment setup .', async () => {
    await duckbenchBuilder.build([], {});

    expect(EnvironmentSetup).toHaveBeenCalledTimes(1);
    expect(EnvironmentSetup).toHaveBeenCalledWith();
    expect(mockEnvironmentSetupInstance.destroy).toHaveBeenCalledTimes(1);
    expect(mockEnvironmentSetupInstance.destroy).toHaveBeenCalledWith();
});

it('creates an environment with the proper config, starts it, and stops it.', async () => {
    await duckbenchBuilder.build([], {});

    expect(WinUAEEnvironment).toHaveBeenCalledTimes(1);
    expect(WinUAEEnvironment).toHaveBeenCalledWith(mockEnvironmentSetupInstance, {});
    expect(mockEnvironmentInstance.start).toHaveBeenCalledTimes(1);
    expect(mockEnvironmentInstance.start).toHaveBeenCalledWith();
    expect(mockEnvironmentInstance.stop).toHaveBeenCalledTimes(2);
    expect(mockEnvironmentInstance.stop).toHaveBeenCalledWith();
});

it('creates a communicator, connects to it and closes it', async () => {
    await duckbenchBuilder.build([], {});

    expect(mockCommunicatorInstance.connect).toHaveBeenCalledTimes(1);
    expect(mockCommunicatorInstance.connect).toHaveBeenCalledWith();
    expect(mockCommunicatorInstance.close).toHaveBeenCalledTimes(2);
    expect(mockCommunicatorInstance.close).toHaveBeenCalledWith();
});

it('creates a runner, configures, prepares, installs and finalises', async () => {
    const testPluginConfig: PluginConfig = {
        id: '',
        name: '',
        optionValues: {}
    };
    await duckbenchBuilder.build([testPluginConfig, testPluginConfig], {});

    expect(Runner).toHaveBeenCalledTimes(1);
    expect(Runner).toHaveBeenCalledWith();
    expect(mockRunnerInstance.configureAndSetup).toHaveBeenCalledTimes(1);
    expect(mockRunnerInstance.configureAndSetup).toHaveBeenCalledWith(
        {name: 'Setup'}, [testPluginConfig, testPluginConfig],
    );
    expect(mockRunnerInstance.prepare).toHaveBeenCalledTimes(1);
    expect(mockRunnerInstance.prepare).toHaveBeenCalledWith(mockEnvironmentSetupInstance, {});
    expect(mockRunnerInstance.install).toHaveBeenCalledTimes(1);
    expect(mockRunnerInstance.install)
        .toHaveBeenCalledWith(mockCommunicatorInstance, mockEnvironmentSetupInstance, {});
    expect(mockRunnerInstance.finalise).toHaveBeenCalledTimes(1);
    expect(mockRunnerInstance.finalise).toHaveBeenCalledWith(mockEnvironmentSetupInstance);
});

it('throws an exception when finalising the environment fails', async () => {
    mockRunnerInstance.finalise.mockImplementation(async () => {
        throw new Error('Some error');
    });

    const testPluginConfig: PluginConfig = {
        id: '',
        name: '',
        optionValues: {}
    };
    return duckbenchBuilder.build([testPluginConfig], {}).then(() => {
        fail('Should throw an exception');
    }).catch((err) => {
        expect(err.message).toEqual('Some error');
        expect(Runner).toHaveBeenCalledTimes(1);
        expect(Runner).toHaveBeenCalledWith();
        expect(mockRunnerInstance.configureAndSetup).toHaveBeenCalledTimes(1);
        expect(mockRunnerInstance.configureAndSetup).toHaveBeenCalledWith({name: 'Setup'}, [testPluginConfig]);
        expect(mockRunnerInstance.prepare).toHaveBeenCalledTimes(1);
        expect(mockRunnerInstance.prepare).toHaveBeenCalledWith(mockEnvironmentSetupInstance, {});
        expect(mockRunnerInstance.install).toHaveBeenCalledTimes(1);
        expect(mockRunnerInstance.install)
            .toHaveBeenCalledWith(mockCommunicatorInstance, mockEnvironmentSetupInstance, {});
        expect(mockRunnerInstance.finalise).toHaveBeenCalledTimes(1);
        expect(mockRunnerInstance.finalise).toHaveBeenCalledWith(mockEnvironmentSetupInstance);
    });
});

it('throws an exception when starting the environment fails', async () => {
    mockEnvironmentInstance.start.mockImplementation(() => {
        throw new Error('Some error');
    });

    return duckbenchBuilder.build([], {}).then(() => {
        fail('Should throw an exception');
    }).catch((err) => {
        expect(err.message).toEqual('Some error');
        expect(WinUAEEnvironment).toHaveBeenCalledTimes(1);
        expect(WinUAEEnvironment).toHaveBeenCalledWith(mockEnvironmentSetupInstance, {});
        expect(mockEnvironmentInstance.start).toHaveBeenCalledTimes(1);
        expect(mockEnvironmentInstance.start).toHaveBeenCalledWith();
        expect(mockEnvironmentInstance.stop).toHaveBeenCalledTimes(1);
        expect(mockEnvironmentInstance.stop).toHaveBeenCalledWith();
    });
});

it('throws an exception when creating the environment fails', async () => {
    vi.mocked(WinUAEEnvironment).mockImplementation(() => {
        throw new Error('Some error');
    });

    return duckbenchBuilder.build([], {}).then(() => {
        fail('Should throw an exception');
    }).catch((err) => {
        expect(err.message).toEqual('Some error');
        expect(WinUAEEnvironment).toHaveBeenCalledTimes(1);
        expect(WinUAEEnvironment).toHaveBeenCalledWith(mockEnvironmentSetupInstance, {});
        expect(mockEnvironmentInstance.stop).toHaveBeenCalledTimes(0);
        expect(mockCommunicatorInstance.close).toHaveBeenCalledTimes(0);
    });
});
