const InstallWorkbench310 = require('../../../src/plugins/InstallWorkbench310');

const standardConfig = {
    optionValues: {
        device: 'dh0:',
        volumeName: 'Workbench',
        size: 100,
    },
};

it('returns UnADF dependency', () => {
    const installWorkbench310 = new InstallWorkbench310();
    const config = installWorkbench310.configure(standardConfig);

    expect(config[0]).toEqual({
        name: 'UnADF',
        optionValues: {
            location: 'duckbench:',
        },
    });
});

it('returns Patch as a dependency', () => {
    const installWorkbench310 = new InstallWorkbench310();
    const config = installWorkbench310.configure(standardConfig);

    expect(config[1]).toEqual({
        name: 'Patch',
        optionValues: {
            location: 'duckbench:c/',
        },
    });
});

it('returns InstallerLG as a dependency', () => {
    const installWorkbench310 = new InstallWorkbench310();
    const config = installWorkbench310.configure(standardConfig);

    expect(config[2]).toEqual({
        name: 'InstallerLG',
        optionValues: {
            location: 'duckbench:c/',
        },
    });
});
