import chalk from "chalk";
import * as webpack from "webpack";
import { log, logError } from "./devApi";
import DevEnvironmentInterface from "./DevEnvironmentInterface";
import * as path from "path";

class WebpackDevEnvironment implements DevEnvironmentInterface {
  public spawn() {
    const conf = require(path.resolve(__dirname, "../../webpack.config.js"));
    webpack(
      {
        ...conf({
          mode: "development"
        })
      },
      (err, stats) => {
        if (err) {
          logError(err.stack || err);
          // @ts-ignore
          if (err.details) {
            // @ts-ignore
            logError(err.details);
          }
        }

        const info = stats.toJson();
        if (stats.hasErrors()) {
          info.errors.forEach(error =>
            logError(chalk.redBright("Webpack : " + error))
          );
        }

        log(chalk.yellowBright.bold("S> --- Webpack ---"));
        log(
          stats.toString({
            colors: true
          })
        );
        log(chalk.yellowBright.bold("S> --- /Webpack ---"));
      }
    );
  }
}

export default WebpackDevEnvironment;
