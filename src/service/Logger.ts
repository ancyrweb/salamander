import * as winston from "winston";
import * as Transport from "winston-transport";
import LoggerInterface from "./LoggerInterface";

const MB = (val: number) => val * 1000000; // Return val in Megabyte

const createFileConfig = (
  filename: string,
  level: string = "info"
): winston.transports.FileTransportOptions => ({
  filename,
  level,
  maxFiles: 5,
  maxsize: MB(10)
});

class Logger implements LoggerInterface {
  public logger: winston.Logger;

  constructor(config: { env: string; path: string; level: string }) {
    if (typeof config.path !== "string") {
      throw new Error("The path must be a valid path");
    }

    const env = config.env;

    this.logger = winston.createLogger({
      level: config.level,
      format: winston.format.combine(
        winston.format.timestamp({ format: "DD/MM/YYYY HH:mm:ss" }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File(
          createFileConfig(config.path + `/${env}.log`)
        ),
        new winston.transports.File(
          createFileConfig(config.path + `/${env}.error.log`, "error")
        ),
        ...(config.env === "prod"
          ? []
          : [
              new winston.transports.Console({
                format: winston.format.combine(
                  winston.format.cli(),
                  winston.format.align()
                )
              })
            ])
      ]
    });
  }

  addTransport(transport: Transport) {
    this.logger.add(transport);
  }

  info(message: string) {
    this.logger.info(message);
  }

  warn(message: string) {
    this.logger.warning(message);
  }

  error(message: string) {
    this.logger.error(message);
  }
}

export default Logger;
