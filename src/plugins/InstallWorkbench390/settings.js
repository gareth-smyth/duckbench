class Settings {
    get() {
        return {
            name: 'InstallWorkbench390',
            label: 'Workbench 3.9',
            settings: [{
                name: 'isoLocation',
                type: 'hostFile',
                label: 'Workbench 3.9 ISO',
            }],
        };
    }
}

module.exports = Settings;
