const BaseSettings = require('../InstallWorkbench310/settings');

class Settings extends BaseSettings {
    constructor() {
        super();
        this.identifier = '2.1';
        this.name = 'InstallWorkbench210';
        this.cacheName = 'wb210_cached';
        this.readableName = 'Workbench 2.1';
        this.disks = [
            {name: 'install', label: 'Install disk'},
            {name: 'workbench', label: 'Workbench disk'},
            {name: 'locale', label: 'Locale disk'},
            {name: 'fonts', label: 'Fonts disk'},
            {name: 'extras', label: 'Extras disk'},
        ];
    }
}

module.exports = Settings;
