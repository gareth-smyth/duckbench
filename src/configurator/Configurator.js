const http = require('http');
const fs = require('fs');
const path = require('path');
const DuckbenchBuilder = require('../builder/DuckbenchBuilder');
const PluginStore = require('../builder/PluginStore');
const Communicator = require('../builder/Communicator');
const WinUAEEnvironment = require('../builder/WinUAEEnvironment');

class Configurator {
    start() {
        http.createServer(function (request, response) {
            Logger.debug(`Request for ${request.url}`);
            if(request.url === '/plugins.json') {
                Logger.trace('Getting plugins');
                const plugins = PluginStore.getStructures();
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(plugins), 'utf-8');
            } else if(request.url === '/run') {
                Logger.trace('Running duckbench builder');
                let body = '';
                request.on('data', chunk => {
                    body += chunk.toString();
                });
                request.on('end', () => {
                    new DuckbenchBuilder().build(JSON.parse(body), WinUAEEnvironment, Communicator);
                });
                response.writeHead(200);
                response.end();
            }

            let filePath = path.join(__dirname, './static', request.url);
            if (filePath === './') {
                filePath = path.join(__dirname, './static/index.html');
            }

            const extname = String(path.extname(filePath)).toLowerCase();
            const mimeTypes = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
            };

            const contentType = mimeTypes[extname] || 'application/octet-stream';
            Logger.debug(`Reading file ${filePath}`);
            fs.readFile(filePath, function (error, content) {
                if (error) {
                    if (error.code === 'ENOENT') {
                        Logger.error(`Did not find file ${filePath}`);
                        Logger.debug(`${JSON.stringify(error)}`);
                        response.writeHead(404);
                        response.end();
                    } else {
                        Logger.error(`Error reading ${filePath}`);
                        Logger.debug(`${JSON.stringify(error)}`);
                        response.writeHead(500);
                        response.end();
                    }
                } else {
                    Logger.trace('Responding with file');
                    response.writeHead(200, {'Content-Type': contentType});
                    response.end(content, 'utf-8');
                }
            });

        }).listen(8552);
        Logger.info('Open a browser at http://127.0.0.1:8552/index.html');
    }
}

module.exports = Configurator;