import fs from 'fs';

jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

import Setup from '../../../src/plugins/InstallWorkbench390';

let settings;
const config = undefined;
const environmentSetup = undefined;

beforeEach(() => {
    settings = {
        InstallWorkbench390: [
            {name: 'isoLocation', value: {file: 'wb39.iso'}},
        ],
    };
});

it('returns no errors when iso location is set and exists', () => {
    mockedFs.existsSync.mockReturnValue(true);
    const errors = new Setup().validate(config, environmentSetup, settings);
    expect(errors).toEqual([]);
    expect(fs.existsSync).toHaveBeenCalledWith('wb39.iso');
    expect(fs.existsSync).toHaveBeenCalledTimes(1);
});

it('returns an error when iso location is not set', () => {
    mockedFs.existsSync.mockReturnValue(true);
    settings['InstallWorkbench390'][0].value.file = '';
    const errors = new Setup().validate(config, environmentSetup, settings);
    expect(errors).toContainEqual({type: 'error', text: 'Workbench 3.9 ISO could not be found'});
    expect(errors.length).toEqual(1);
});

it('returns an error when iso location is set but does not exist', () => {
    mockedFs.existsSync.mockReturnValue(false);
    const errors = new Setup().validate(config, environmentSetup, settings);
    expect(errors).toContainEqual({type: 'error', text: 'Workbench 3.9 ISO could not be found at wb39.iso'});
    expect(fs.existsSync).toHaveBeenCalledWith('wb39.iso');
});
