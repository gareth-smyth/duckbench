class CD32 {
    structure() {
        return {
            name: 'CD32',
            label: 'Amiga CD32',
            description: 'The Ultimate Game Machine',
            type: 'system',
            options: {
                processor: {
                    name: 'processor',
                    label: 'Processor',
                    type: 'list',
                    items: [
                        '68020',
                        '68030',
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
                floppyDrive: {
                    name: 'floppyDrive',
                    label: 'Floppy Drive?',
                    type: 'list',
                    items: [
                        'No',
                        'Yes',
                    ],
                    default: 'No',
                },
            },
        };
    }

    prepare(config, environmentSetup) {
        environmentSetup.setSystemName('cd32');
        environmentSetup.setRom('3.1');
        environmentSetup.setCPU(config.optionValues.processor);
        environmentSetup.setChipMem('2');
        environmentSetup.setFastMem(config.optionValues.fastMem);
        environmentSetup.setFloppyDrive(config.optionValues.floppyDrive === 'Yes');
    }
}

module.exports = CD32;
