/* istanbul ignore file */
const fs = require('fs');
const path = require('path');

global.BASE_DIR = path.join(__dirname, '../../');
global.TOOLS_DIR = path.join(global.BASE_DIR, 'external_tools');
global.CACHE_DIR = path.join(global.BASE_DIR, 'cache');

if (!fs.existsSync(global.CACHE_DIR)) {
    fs.mkdirSync(global.CACHE_DIR);
}

if (!fs.existsSync(global.TOOLS_DIR)) {
    fs.mkdirSync(global.TOOLS_DIR);
}
