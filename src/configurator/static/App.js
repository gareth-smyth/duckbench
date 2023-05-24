import Configuration from './Configuration.js';
import PluginSelect from './PluginSelect.js';
import Settings from './settings/Settings.js';
import Build from './Build.js';

export default class App {
    constructor() {
        this.configuration = new Configuration();
        this.messages = [];
    }

    oninit() {
        m.request({method: "GET", url: "/plugins.json"}).then((plugins) => {
            this.configuration.setPlugins(plugins);
        });
        m.request({method: "GET", url: "/settings.json"}).then((settings) => {
            this.configuration.setSettings(settings);
        });
        this.getCurrentSettings();
    }

    getCurrentSettings() {
        m.request({method: 'GET', url: '/currentSettings'}).then((currentSettings) => {
            this.configuration.setCurrentSettings(currentSettings);
        });
    }

    view() {
        if(this.configuration.plugins && this.configuration.settings && this.configuration.currentSettings) {
            return [
                // m('pre', {style: 'position:absolute', 'overflow-y': 'scroll'}, JSON.stringify(this.configuration, null, 2)), // DEBUG ONLY
                m('nav.navbar.navbar-default.fixed-top.navbar-inverse.bg-primary', [
                    m('.container',
                        m('.container', [
                            m('h2.mt-2', 'Duckbench'),
                            m('.nav.mr-5', [
                                m('label.btn.btn-info.my-2.my-sm-0.ml-auto.mr-2', {for: 'LoadFile'}, "Load"),
                                m('input', {id: "LoadFile", style: "display:none", type:"file", onchange: this.load.bind(this)}),
                                m('a.btn.btn-info.my-2.my-sm-0.ml-auto.mr-2', {download: "workbench.db", href: '/save', onclick: this.save.bind(this)}, "Save"),
                                m('button.btn.btn-success.my-2.my-sm-0.ml-auto.mr-2', {onclick: this.runBuild.bind(this)}, "Build Workbench"),
                                m('button.btn.btn-warning.my-2.my-sm-0.ml-auto.mr-2', {'data-toggle': 'modal', 'data-target': '#settingsModal'}, [
                                    m('img.mr-2.align-middle', { src: "./images/gear-fill.svg", width:"23", height:"23", title:"Configure"}),
                                    m('span.align-middle', "Settings"),
                                ]),
                            ]),
                        ]),
                    ),
                ]),
            m("", [
                m('.container.section-container', [
                    m('h2.mb-4.mt-4', "How would you like to partition your hard drives?"),
                    m(PluginSelect, {
                        configuration: this.configuration,
                        includeTypes: ['partition'],
                        id: this.configuration.getPartitionSelectedPlugin().id,
                        noRemove: true,
                    }),
                ]),
                m('.container.section-container', [
                    m('h2.mb-4.mt-4', "Which version of Workbench would you like to install?"),
                    m(PluginSelect, {
                        configuration: this.configuration,
                        includeTypes: ['workbench'],
                        id: this.configuration.getWorkbenchSelectedPlugin().id,
                        noRemove: true,
                    }),
                ]),
                m('.container.section-container', [
                    m('h2.mb-4.mt-4', "Which Amiga are you running?"),
                    m(PluginSelect, {
                        configuration: this.configuration,
                        includeTypes: ['system'],
                        id: this.configuration.getSystemSelectedPlugin().id,
                        noRemove: true,
                    }),
                ]),
                m('.container.section-container', [
                    m('h2.mb-4.mt-4', "Which tools would you like to install?"),
                    m('', this.configuration.getNonRootSelectedPlugins().map(selectedPlugin => {
                        return m(PluginSelect, {
                            configuration: this.configuration,
                            ignoreTypes: ['workbench', 'internal', 'partition', 'system'],
                            id: selectedPlugin.id,
                        });
                    })),
                    m('.mt-4', [
                        m('button.btn.btn-primary', {onclick: () => this.configuration.addSelectedPlugin() }, "Add"),
                    ]),
                    m('button.btn.btn-success.mt-5', {'data-toggle': 'modal', 'data-target': '#buildModal', onclick: this.runBuild.bind(this)}, "Build Workbench"),
                ]),
            ]),
            m('.modal', {id: 'settingsModal'}, [
                m('.modal-dialog.modal-lg', [
                    m('.modal-content', [
                        m('.modal-header', [
                            m('h3', 'Settings'),
                            m('button.close', {'data-dismiss': 'modal'}, [
                                m('span', [m.trust('&times;')]),
                            ]),
                        ]),
                        m('.modal-body', [m(Settings, {settings: this.configuration.settings, currentSettings: this.configuration.currentSettings})]),
                        m('.modal-footer', [
                            m('buttons.btn.btn-secondary.mr-auto', {'data-dismiss': 'modal', onclick: this.getCurrentSettings.bind(this)}, 'Restore saved'),
                            m('buttons.btn.btn-secondary', {'data-dismiss': 'modal'}, 'Use, don\'t save'),
                            m('buttons.btn.btn-primary', {'data-dismiss': 'modal', onclick: this.saveSettings.bind(this)}, 'Save'),
                        ]),
                    ]),
                ]),
            ]),
            m('.modal', {id: 'buildModal'}, [
                m('.modal-dialog.modal-lg', [
                    m('.modal-content', [
                        m('.modal-header', [
                            m('h3', 'Build status'),
                            m('button.close', {'data-dismiss': 'modal'}, [
                                m('span', [m.trust('&times;')]),
                            ]),
                        ]),
                        m('.modal-body', [m(Build, { messages: this.messages })]),
                    ]),
                ]),
            ])];
        } else {
            return m("main", [
                m('h2', 'Duckbench'),
                m('div', 'Loading plugins and settings...'),
            ]);
        }
    }

    findMessage(messages, id) {
        for(let msgIdx = 0; msgIdx < messages.length; msgIdx++) {
            const message = messages[msgIdx];
            if(message.id === id) {
                return message;
            } else if(message.children.length) {
                messages.push(...message.children);
            }
        }
    }

    runBuild() {
        const ws = new WebSocket('ws://localhost:8553');
        ws.onopen = () => {
            ws.send(JSON.stringify({
                command: 'RUN',
                config: this.configuration.selectedPlugins,
                settings: this.configuration.currentSettings,
            }));
            this.messages.length = 0;
        };
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if(data.parentId) {
                const parentMessage = this.findMessage(this.messages.slice(), data.parentId);
                parentMessage.children.push({...data, startAt: Date.now(), updateAt: Date.now(), children: [], type: 'info'});
            } else if(data.action === 'update') {
                const originalMessage = this.findMessage(this.messages.slice(), data.id);
                Object.assign(originalMessage, data, {updateAt: Date.now()});
                if(data.percentComplete === 100) {
                    originalMessage.type = 'success';
                }
            } else {
                this.messages.push({...data, startAt: Date.now(), updateAt: Date.now(), children: [], type: 'info'});
            }
            m.redraw();
            setInterval(() => {
                m.redraw();
            }, 900);
        }
    }

    save(event) {
        event.target.href = `data:application/json,${JSON.stringify(this.configuration.selectedPlugins)}`;
    }

    saveSettings() {
        return m.request({method: "POST", url: "/currentSettings", body: this.configuration.currentSettings});
    }

    load(event) {
        const file = event.target.files[0];
        const fileReader = new FileReader();
        fileReader.onload = () => {
            this.configuration.selectedPlugins = JSON.parse(fileReader.result);
            this.configuration.findCurrentId();
            m.redraw();
        };
        event.target.value = "";
        if(file) {
            fileReader.readAsText(file);
            return true;
        }

    }
}
