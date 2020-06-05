import Configuration from './Configuration.js';
import PluginSelect from './PluginSelect.js';

export default class App {
    constructor() {
        this.configuration = new Configuration();
    }

    oninit() {
        m.request({method: "GET", url: "/plugins.json"}).then((plugins) => {
            this.configuration.setPlugins(plugins);
        });
    }

    view() {
        if(this.configuration.plugins) {
            return [
                m('nav.navbar.navbar-default.fixed-top.navbar-inverse.bg-primary', [
                    m('.container',
                        m('.container', [
                            m('h2.mt-2', 'Duckbench'),
                            m('.nav.mr-5', [
                                m('label.btn.btn-info.my-2.my-sm-0.ml-auto.mr-2', {for: 'LoadFile'}, "Load"),
                                m('input', {id: "LoadFile", style: "display:none", type:"file", onchange: this.load.bind(this)}),
                                m('a.btn.btn-info.my-2.my-sm-0.ml-auto.mr-2', {download: "workbench.db", href: '/save', onclick: this.save.bind(this)}, "Save"),
                                m('button.btn.btn-success.my-2.my-sm-0.ml-auto.mr-2', {onclick: this.runBuild.bind(this)}, "Build Workbench"),
                            ]),
                        ]),
                    ),
                ]),
            m("", [
                m('.container.section-container', [
                    m('h2.mb-4.mt-4', "Which version of Workbench would you like to install?"),
                    m(PluginSelect, {
                        configuration: this.configuration,
                        includeTypes: ['root'],
                        id: this.configuration.getRootSelectedPlugin().id,
                        noRemove: true,
                    }),
                ]),
                m('.container.section-container', {style:`display:${this.configuration.getRootSelectedPlugin().name === undefined ? 'none': 'default'}`}, [
                    m('h2.mb-4.mt-4', "Which tools would you like to install?"),
                    m('', this.configuration.getNonRootSelectedPlugins().map(selectedPlugin => {
                        return m(PluginSelect, {
                            configuration: this.configuration,
                            ignoreTypes: ['root', 'internal'],
                            id: selectedPlugin.id,
                        });
                    })),
                    m('.mt-4', [
                        m('button.btn.btn-primary', {onclick: () => this.configuration.addSelectedPlugin() }, "Add"),
                    ]),
                    m('button.btn.btn-success.mt-5', {onclick: this.runBuild.bind(this)}, "Build Workbench"),
                ]),
            ])];
        } else {
            return m("main", [
                m('h2', 'Duckbench'),
                m('div', 'Loading plugins...'),
            ]);
        }
    }

    runBuild() {
        return m.request({method: "POST", url: "/run", body: this.configuration.selectedPlugins});
    }

    save(event) {
        event.target.href = `data:application/json,${JSON.stringify(this.configuration.selectedPlugins)}`;
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
