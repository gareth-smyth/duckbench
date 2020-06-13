/* istanbul ignore file */
const path = require('path');

global.BASE_DIR = path.join(__dirname, '../../');
global.TOOLS_DIR = path.join(global.BASE_DIR, 'external_tools');
global.CACHE_DIR = path.join(global.BASE_DIR, 'cache');
