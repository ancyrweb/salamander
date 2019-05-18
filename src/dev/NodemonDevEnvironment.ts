import chalk from "chalk";
import * as nodemon from "nodemon";
import { log } from "./devApi";
import DevEnvironmentInterface from "./DevEnvironmentInterface";

class NodemonDevEnvironment implements DevEnvironmentInterface {
  private data: any;

  constructor(data) {
    this.data = data;
  }

  public spawn() {
    let isInitial = false;

    log(chalk.bold.yellowBright("Salamander v1.0.0 - Development Runtime"));
    log(
      "S> I will take care of running the development environment in background for you :)"
    );

    nodemon(this.data);
    nodemon
      .on("start", function() {
        if (isInitial === true) return;

        isInitial = true;
        log(chalk.bold.yellowBright("S> Nodemon started!"));
      })
      .on("quit", function() {
        log(chalk.bold.yellowBright("S> Bye bye !"));
        process.exit(0); // Avoid EIO error
      })
      .on("restart", function() {
        log(chalk.bold.yellowBright("S> Files changed, reloading..."));
      });
  }
}

export default NodemonDevEnvironment;
