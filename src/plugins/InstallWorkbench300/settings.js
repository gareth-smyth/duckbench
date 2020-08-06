const BaseSettings = require('../InstallWorkbench310/settings');

class Settings extends BaseSettings {
    constructor() {
        super();
        this.identifier = '3.0';
        this.name = 'InstallWorkbench300';
        this.cacheName = 'wb300_cached';
        this.readableName = 'Workbench 3.0';
        this.disks = [
            {name: 'install', label: 'Install disk'},
            {name: 'workbench', label: 'Workbench disk'},
            {name: 'locale', label: 'Locale disk'},
            {name: 'fonts', label: 'Fonts disk'},
            {name: 'extras', label: 'Extras disk'},
            {name: 'storage', label: 'Storage disk'},
        ];
    }
}

module.exports = Settings;
