const InstallWorkbench390 = require('../../../src/plugins/InstallWorkbench390');

const standardConfig = {
    optionValues: {
        device: 'dh0:',
        volumeName: 'Workbench',
        size: 100,
    },
};

it('returns InstallerLG as a dependency', () => {
    const installWorkbench310 = new InstallWorkbench390();
    const config = installWorkbench310.configure(standardConfig);

    expect(config[0]).toEqual({
        name: 'InstallerLG',
        optionValues: {
            location: 'duckbench:c/',
        },
    });
});

it('returns Patch as a dependency', () => {
    const installWorkbench310 = new InstallWorkbench390();
    const config = installWorkbench310.configure(standardConfig);

    expect(config[1]).toEqual({
        name: 'Patch',
        optionValues: {
            location: 'duckbench:c/',
        },
    });
});
