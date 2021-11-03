class A500 {
    structure() {
        return {
            name: 'Amiga500',
            label: 'Amiga 500',
            description: 'Only Amiga makes it possible.',
            type: 'system',
            options: {
                rom: {
                    name: 'rom',
                    label: 'Kickstart Version',
                    type: 'list',
                    items: [
                        {label: '2.0/2.05', value: '2.05'},
                        {label: '3.1', value: '3.1'},
                        {label: '3.2', value: '3.2'},
                    ],
                    default: '3.1',
                },
                processor: {
                    name: 'processor',
                    label: 'Processor',
                    type: 'list',
                    items: [
                        '68000',
                        '68020',
                        '68030',
                        '68040',
                        '68060',
                    ],
                    default: '68000',
                },
                chipMem: {
                    name: 'chipMem',
                    label: 'Chip RAM',
                    type: 'list',
                    items: [
                        {label: '0.5 MB', value: '1'},
                        {label: '1 MB', value: '2'},
                        {label: '1.5 MB', value: '3'},
                        {label: '2 MB', value: '4'},
                    ],
                    default: '2',
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
        environmentSetup.setSystemName('a500');
        environmentSetup.setCPU(config.optionValues.processor);
        environmentSetup.setRom(config.optionValues.rom);
        environmentSetup.setChipMem(config.optionValues.chipMem);
        environmentSetup.setFastMem(config.optionValues.fastMem);
        environmentSetup.setFloppyDrive(true);
    }
}

module.exports = A500;
