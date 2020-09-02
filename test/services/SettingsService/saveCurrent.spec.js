const path = require('path');
const fs = require('fs');
jest.mock('fs');

const SettingsService = require('../../../src/services/SettingsService');

it('calls write file with the received settings', () => {
    SettingsService.saveCurrent({a: 'one'});
    expect(fs.writeFileSync)
        .toHaveBeenCalledWith(path.join(global.BASE_DIR, 'db_settings.json'), JSON.stringify({a: 'one'}));
});
