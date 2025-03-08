import path from 'path';
import fs from 'fs';
jest.mock('fs');

import SettingsService from '../../../src/services/SettingsService';

it('calls write file with the received settings', () => {
    SettingsService.saveCurrent({a: 'one'});
    expect(fs.writeFileSync)
        .toHaveBeenCalledWith(path.join(global.BASE_DIR, 'db_settings.json'), JSON.stringify({a: 'one'}));
});
