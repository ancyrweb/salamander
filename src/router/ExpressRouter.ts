import * as express from "express";
import * as onFinished from "on-finished";
import * as cors from "cors";
import chalk from "chalk";

import RouterInterface from "../interface/RouterInterface";
import { Metadata } from "../kernel/MetadataCollector";
import { logger, url } from "../helper";
import { StringMap } from "../types";

const argRegex = /:(\w*)/g;

type Route = {
  target: object;
  targetMethodName: string;
  path: string;
  method: string;
  params: any[] | null;
};

type Config = {
  spa?: string;
  views: string;
  public: string;
};

class ExpressRouter implements RouterInterface {
  private routes: StringMap<Route> = {};
  private config: Config;

  constructor(config?: Config) {
    this.config = config;
  }

  receiveMetadata(instance: object, data: Metadata[] & { name: string }) {
    for (let metadata of data) {
      if (metadata.type === "web") {
        let params = null;
        const method = metadata.method.toLowerCase();
        if (method === "get") {
          const matches = metadata.path.match(argRegex);
          if (matches) {
            params = matches.map(str => str.substr(1));
          }
        }

        this.routes[metadata.name] = {
          target: instance,
          targetMethodName: metadata.methodName,
          path: metadata.path,
          method,
          params
        };
      }
    }
  }

  integrate(app: express.Application) {
    app.set("views", this.config.views);
    app.use(express.static(this.config.public));
    app.use(cors());

    Object.keys(this.routes).forEach(key => {
      const route = this.routes[key];
      if (route.path.startsWith("/") === false) {
        console.warn(
          `Paths must start with a /. Check the route for ${route.path}`
        );
      }

      app[route.method](route.path, async (req, res) => {
        let params = [];
        if (route.method === "get" && route.params) {
          params = route.params.map(name => req.params[name]);
        }

        // Give the query object
        params.push(req.query);

        // We provide the app as a last parameter to the stack
        params.push(res.locals.app);

        logRequest(req, res);
        const result = await route.target[route.targetMethodName](...params);
        if (result) {
          if (result.__smtpl__) {
            res.render(result.name, result.params);
            return;
          }

          res.send(result);
        }
      });
    });

    if (this.config && this.config.spa) {
      app.use("*", (req, res) => {
        res.sendFile(this.config.spa);
      });
    }
  }

  generateURL(name: string, params?: object) {
    params = params || {};

    const route = this.routes[name];
    if (!route) {
      throw new Error("Cannot find route with name " + name);
    }

    const out =
      url() +
      Object.keys(params).reduce((accUrl, key) => {
        return accUrl.replace(":" + key, params[key]);
      }, route.path);

    return out;
  }
}

function logRequest(req, res) {
  // @ts-ignore
  res._startTime = new Date();
  onFinished(res, (err, res) => {
    let elapsedTime = Math.round(
      new Date().getTime() - res._startTime.getTime()
    );
    let unit = "ms";
    if (elapsedTime > 1000) {
      elapsedTime /= 1000;
      unit = "s";
    }

    let statusCode = res.statusCode;
    if (statusCode < 400) {
      statusCode = chalk.greenBright.bold(statusCode);
    } else if (statusCode < 500) {
      statusCode = chalk.yellowBright.bold(statusCode);
    } else {
      statusCode = chalk.redBright.bold(statusCode);
    }
    logger().info(
      `${req.method.toUpperCase()} ${
        req.path
      } ${statusCode} ${elapsedTime}${unit} `
    );
  });
}

export default ExpressRouter;
