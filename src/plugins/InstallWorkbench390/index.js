const fs = require('fs-extra');
const path = require('path');

const BaseInstall = require('../InstallWorkbench310');

class InstallWorkbench390 extends BaseInstall {
    constructor() {
        super();
        this.identifier = '3.9';
        this.dirName = __dirname;
        this.name = 'InstallWorkbench390';
        this.cacheName = 'wb390_cached';
        this.readableName = 'Workbench 3.9';
        this.installFileLocation = 'DB_CLIENT_CACHE:InstallWorkbench390/installcd/OS3.9Install';
        this.installationSuccessMessage = 'The installation of Release 3.9 is now complete.';
        this.disks = [
            {name: 'install', label: 'Install disk'},
            {name: 'workbench', label: 'Workbench disk', diskName: 'Workbench3.1', assign: 'Workbench3.1:'},
            {name: 'locale', label: 'Locale disk'},
            {name: 'fonts', label: 'Fonts disk'},
            {name: 'extras', label: 'Extras disk'},
            {name: 'storage', label: 'Storage disk'},
        ];
    }

    prepareDisks(settings, environmentSetup) {
        const cacheMarkerPath = path.join(global.CACHE_DIR, this.cacheName);
        if (!fs.existsSync(cacheMarkerPath)) {
            const isoLocation = settings[this.name].find((setting) => setting.name === 'isoLocation');
            environmentSetup.insertCDISO(isoLocation.value.file);
        }
    }

    async installToCache(communicator, unADF, patch, installerLg) {
        const cacheMarkerPath = path.join(global.CACHE_DIR, this.cacheName);
        if (!fs.existsSync(cacheMarkerPath)) {
            Logger.debug(`${this.readableName} not yet cached. Building cache.`);

            await communicator.delete(`DB_CLIENT_CACHE:${this.name}`, {'ALL': true}, undefined, /.*/);
            await communicator.makedir(`DB_CLIENT_CACHE:${this.name}`);
            await communicator.makedir(`DB_CLIENT_CACHE:${this.name}/wb`);
            await communicator.makedir(`DB_CLIENT_CACHE:${this.name}/installcd`);
            await communicator.copy('CD0:OS-Version3.9', `DB_CLIENT_CACHE:${this.name}/installcd`,
                {'ALL': true, 'CLONE': true}, undefined, '..copied');
            await communicator.protect(`DB_CLIENT_CACHE:${this.name}/installcd`,
                {'+wd': true, 'all': true}, undefined, '..done');

            await patch.run(this.installFileLocation, `DB_EXECUTION:wb${this.identifier}_install.patch`,
                'duckbench:c/', {}, communicator);

            const installOptions = {REDIRECT_IN: `DB_EXECUTION:wb${this.identifier}_install_key`};
            await installerLg.run(this.installFileLocation, installOptions, communicator,
                this.handleInstallUpdates, this.installationSuccessMessage);

            fs.closeSync(fs.openSync(cacheMarkerPath, 'w'));
        }
    }
}

module.exports = InstallWorkbench390;
