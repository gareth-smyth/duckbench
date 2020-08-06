const BaseInstall = require('../InstallWorkbench310');

class InstallWorkbench210 extends BaseInstall {
    constructor() {
        super();
        this.identifier = '2.1';
        this.dirName = __dirname;
        this.name = 'InstallWorkbench210';
        this.cacheName = 'wb210_cached';
        this.readableName = 'Workbench 2.1';
        this.installFileLocation = '"Install2.1:Install 2.1/Install 2.1"';
        this.installationSuccessMessage = 'Installation complete';
        this.disks = [
            {name: 'install', label: 'Install disk', diskName: 'Install2.1', assign: 'Install2.1:'},
            {name: 'workbench', label: 'Workbench disk', diskName: 'Workbench2.1', assign: 'Workbench2.1:'},
            {name: 'locale', label: 'Locale disk', diskName: 'Locale', assign: 'Locale:'},
            {name: 'fonts', label: 'Fonts disk', diskName: 'Fonts', assign: 'Fonts:'},
            {name: 'extras', label: 'Extras disk', diskName: 'Extras2.1', assign: 'Extras2.1:'},
        ];
    }
}

module.exports = InstallWorkbench210;
