const InstallWorkbench320 = require('../../../src/plugins/InstallWorkbench320');

const standardConfig = {
    optionValues: {
        device: 'dh0:',
        volumeName: 'Workbench',
        size: 100,
    },
};

it('returns UnADF dependency', () => {
    const installWorkbench320 = new InstallWorkbench320();
    const config = installWorkbench320.configure(standardConfig);

    expect(config[0]).toEqual({
        name: 'UnADF',
        optionValues: {
            location: 'duckbench:',
        },
    });
});

it('returns Patch as a dependency', () => {
    const installWorkbench320 = new InstallWorkbench320();
    const config = installWorkbench320.configure(standardConfig);

    expect(config[1]).toEqual({
        name: 'Patch',
        optionValues: {
            location: 'duckbench:c/',
        },
    });
});

it('returns InstallerLG as a dependency', () => {
    const installWorkbench320 = new InstallWorkbench320();
    const config = installWorkbench320.configure(standardConfig);

    expect(config[2]).toEqual({
        name: 'InstallerLG',
        optionValues: {
            location: 'duckbench:c/',
        },
    });
});
