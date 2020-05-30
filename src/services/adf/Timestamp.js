const moment = require('moment');

const START_OF_TIME = [1979, 1, 1];

class CheckSum {
    constructor(buffer) {
        this.buffer = buffer;
    }

    write(time) {
        const startOfTime = moment.utc(START_OF_TIME);
        const createDays = moment.utc(time).diff(startOfTime, 'days');
        const createMinutes = moment.utc().diff(time, 'minutes');
        const createTicks = moment.utc().seconds() * 50;
        this.buffer.writeInt32BE(createDays, 0);
        this.buffer.writeInt32BE(createMinutes, 4);
        this.buffer.writeInt32BE(createTicks, 8);
    }
}

module.exports = CheckSum;
