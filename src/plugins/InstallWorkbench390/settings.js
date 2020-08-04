const fs = require('fs');
const path = require('path');

class Settings {
    get() {
        const cacheMarkerPath = path.join(global.CACHE_DIR, 'wb390_cached');
        return {
            name: 'InstallWorkbench390',
            label: 'Workbench 3.9',
            settings: [{
                name: 'isoLocation',
                type: 'hostFile',
                label: '3.9 .ISO file',
                cached: fs.existsSync(cacheMarkerPath),
            }],
        };
    }
}

module.exports = Settings;
