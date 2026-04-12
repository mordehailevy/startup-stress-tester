import pino from "pino";
import config from "./index";

const logger = pino({
  level: config.isTest ? "silent" : config.isProduction ? "info" : "debug",
  transport: config.isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
});

export default logger;
