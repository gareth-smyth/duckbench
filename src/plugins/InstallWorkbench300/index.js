const BaseInstall = require('../InstallWorkbench310');

class InstallWorkbench300 extends BaseInstall {
    constructor() {
        super();
        this.identifier = '3.0';
        this.dirName = __dirname;
        this.name = 'InstallWorkbench300';
        this.cacheName = 'wb300_cached';
        this.readableName = 'Workbench 3.0';
        this.installFileLocation = 'Install3.0:Install/Install';
        this.installationSuccessMessage = 'The installation of Release 3 is now complete.';
        this.disks = [
            {name: 'install', label: 'Install disk', diskName: 'Install3.0', assign: 'Install3.0:'},
            {name: 'workbench', label: 'Workbench disk', diskName: 'Workbench3.0', assign: 'Workbench3.0:'},
            {name: 'locale', label: 'Locale disk', diskName: 'Locale', assign: 'Locale:'},
            {name: 'fonts', label: 'Fonts disk', diskName: 'Fonts', assign: 'Fonts:'},
            {name: 'extras', label: 'Extras disk', diskName: 'Extras3.0', assign: 'Extras3.0:'},
            {name: 'storage', label: 'Storage disk', diskName: 'Storage3.0', assign: 'Storage3.0:'},
        ];
    }
}

module.exports = InstallWorkbench300;
