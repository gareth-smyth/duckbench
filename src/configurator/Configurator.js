const http = require('http');
const fs = require('fs');
const path = require('path');
const URL = require('url').URL;
const WebSocket = require('ws');
const DuckbenchBuilder = require('../builder/DuckbenchBuilder');
const PluginStore = require('../builder/PluginStore');
const Communicator = require('../builder/Communicator');
const SettingsService = require('../services/SettingsService');
const WinUAEEnvironment = require('../builder/WinUAEEnvironment');
const ValidationError = require('../errors/ValidationError');


class Configurator {
    start() {
        this.startHTTPHandler();
        this.startSocketHandler();
    }

    startSocketHandler() {
        const server = new WebSocket.Server({port: 8553});
        server.on('connection', (socket) => {
            socket.on('message', (message) => {
                Logger.trace(`Message received - ${message}`);
                const payload = JSON.parse(message);
                switch(payload.command) {
                case 'RUN':
                    Logger.trace('Running duckbench builder');
                    socket.send(JSON.stringify({ type: 'warning', text: 'Running builder' }));
                    new DuckbenchBuilder().build(payload.config, WinUAEEnvironment, Communicator, payload.settings).then(() => {
                        socket.send(JSON.stringify({ type: 'info', text: 'Build complete' }));
                    }).catch((err) => {
                        if(err instanceof ValidationError) {
                            err.validationErrors.forEach(error => {
                               socket.send(JSON.stringify({type: 'danger', text: `Build failed ${error.text}`}))
                            });
                        } else {
                            socket.send(JSON.stringify({type: 'danger', text: `Build failed ${err}`}));
                        }
                    });
                    break;
                default:
                    Logger.error('Received unknown command');
                }
            });
        });
    }

    startHTTPHandler() {
        const server = http.createServer();
        server.on('request', async (request, response) => {
            Logger.debug(`Request for ${request.url}`);
            const url = new URL(request.url, 'http://localhost');
            if (url.pathname === '/plugins.json') {
                Logger.trace('Getting plugins');
                const plugins = await PluginStore.getStructures();
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(plugins), 'utf-8');
                return;
            } else if (url.pathname === '/settings.json') {
                Logger.trace('Getting settings');
                const plugins = await SettingsService.getAvailable();
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(plugins), 'utf-8');
                return;
            } else if (url.pathname === '/currentSettings') {
                if (request.method === 'GET') {
                    Logger.trace('Getting settings');
                    const currentSettings = await SettingsService.loadCurrent();
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(JSON.stringify(currentSettings), 'utf-8');
                    return;
                } else {
                    Logger.trace('Saving settings');
                    let body = '';
                    request.on('data', chunk => {
                        body += chunk.toString();
                    });
                    request.on('end', () => {
                        SettingsService.saveCurrent(JSON.parse(body));
                    });
                    response.writeHead(200);
                    response.end();
                    return;
                }
            } else if (url.pathname === '/setting/default') {
                const plugin = url.searchParams.get('plugin');
                const setting = url.searchParams.get('setting');
                const defaultValue = await SettingsService.getDefault(plugin, setting);
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(defaultValue), 'utf-8');
                return;
            }

            let filePath = path.join(__dirname, './static', url.pathname);
            if (filePath === './' || url.pathname === '/') {
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
            fs.readFile(filePath, function(error, content) {
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

        });
        server.listen(8552);
        Logger.info('Browse http://127.0.0.1:8552/index.html');
    }
}

module.exports = Configurator;
