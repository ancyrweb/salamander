import chalk from "chalk";
import * as webpack from "webpack";
import * as WebpackDevServer from "webpack-dev-server";
import * as addEntries from "webpack-dev-server/lib/utils/addEntries";
import { log, logError } from "./devApi";
import DevEnvironmentInterface from "./DevEnvironmentInterface";
import * as path from "path";

class WebpackDevServerEnvironment implements DevEnvironmentInterface {
  public spawn() {
    const conf = require(path.resolve(__dirname, "../../webpack.config.js"))({
      mode: "development"
    });

    addEntries(conf, conf.devServer);
    const compiler = webpack({
      ...conf
    });

    const server = new WebpackDevServer(compiler, conf.devServer);
    const port = conf.devServer.port || 3009;
    server.listen(port, "localhost", function(err) {
      if (err) {
        logError(err);
      }

      log(chalk.bold.yellowBright(`S> Webpack runs on port ${port}`));
    });
  }
}

export default WebpackDevServerEnvironment;
