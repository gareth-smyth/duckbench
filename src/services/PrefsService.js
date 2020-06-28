const ScreenMode = require('./prefs/ScreenMode');

class PrefsService {
    screenMode(screenModePrefs) {
        return new ScreenMode(screenModePrefs);
    }
}

module.exports = PrefsService;
