class A1200 {
    structure() {
        return {
            name: 'Amiga1200',
            label: 'Amiga 1200',
            description: 'The home computer for the 90s',
            type: 'system',
            options: {
                rom: {
                    name: 'rom',
                    label: 'Kickstart Version',
                    type: 'list',
                    items: [
                        '3.0',
                        '3.1',
                        '3.2',
                    ],
                    default: '3.1',
                },
                processor: {
                    name: 'processor',
                    label: 'Processor',
                    type: 'list',
                    items: [
                        '68020',
                        '68030',
                        '68040',
                        '68060',
                    ],
                    default: '68020',
                },
                fastMem: {
                    name: 'fastMem',
                    label: 'Other RAM',
                    type: 'list',
                    items: [
                        {label: 'None', value: '0'},
                        {label: '4 MB+', value: '4'},
                        {label: '8 MB+', value: '8'},
                        {label: '64 MB+', value: '64'},
                    ],
                    default: '0',
                },
            },
        };
    }

    prepare(config, environmentSetup) {
        environmentSetup.setSystemName('a1200');
        environmentSetup.setRom(config.optionValues.rom);
        environmentSetup.setCPU(config.optionValues.processor);
        environmentSetup.setChipMem('2');
        environmentSetup.setFastMem(config.optionValues.fastMem);
        environmentSetup.setFloppyDrive(true);
    }
}

module.exports = A1200;
