import InstallWorkbench310 from '../../../src/plugins/InstallWorkbench310';

it('returns UnADF dependency', () => {
    const installWorkbench310 = new InstallWorkbench310();
    const config = installWorkbench310.configure();

    expect(config[0]).toEqual({
        name: 'UnADF',
        optionValues: {
            location: 'duckbench:',
        },
    });
});

it('returns Patch as a dependency', () => {
    const installWorkbench310 = new InstallWorkbench310();
    const config = installWorkbench310.configure();

    expect(config[1]).toEqual({
        name: 'Patch',
        optionValues: {
            location: 'duckbench:c/',
        },
    });
});

it('returns InstallerLG as a dependency', () => {
    const installWorkbench310 = new InstallWorkbench310();
    const config = installWorkbench310.configure();

    expect(config[2]).toEqual({
        name: 'InstallerLG',
        optionValues: {
            location: 'duckbench:c/',
        },
    });
});
