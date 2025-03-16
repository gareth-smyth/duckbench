/* istanbul ignore file -- @preserve */

import log from "pino";

const Logger = log({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: "HH:MM:ss",
    },
  },
});

export default Logger;
