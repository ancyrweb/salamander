import ControllerInterface from "../interface/ControllerInterface";
import RouterInterface from "../interface/RouterInterface";

import * as express from "express";
import * as bodyParser from "body-parser";

import MetadataCollector from "./MetadataCollector";
import RequestContext from "./RequestContext";
import MiddlewareInterface from "../interface/MiddlewareInterface";
import LoggerInterface from "../service/LoggerInterface";
import { StringMap } from "../../src/typings/types";

type AppConfigureConf = {
  config: object;
  logger: LoggerInterface;
  controllers: ControllerInterface[];
  routers: RouterInterface[];
  middlewares: MiddlewareInterface[];
  services: any[];
};

let uniqId = 1;

/**
 * @class App
 * Core class
 *
 * Service custom fields :
 * __smuid__  : ID of the service (unique identifier given by the app)
 * __smcfgr__ : configurator. If provided, the app calls it in order to instantiate the object.
 * __smtpl__  : used by the express middleware to differentiate raw object and view objects
 */
class App {
  public app: express.Application;
  public services: StringMap<any> = {};
  public routers: StringMap<any> = {};
  public logger: LoggerInterface;

  public url: string = null;

  initialize() {
    let _that = this;

    this.app = express();
    this.app.use(bodyParser.json({ limit: "10mb" }));
    this.app.use(function(req: any, res, next) {
      if (_that !== null) {
        _that.url = req.protocol + "://" + req.get("host");
        _that = null; // clear ref for G.C
      }

      res.locals.app = new RequestContext();
      next();
    });
  }

  /*
  App => Request / Response router
  Returns a response for a request
  It has a router queue in which various components pass
  App => Authorization Handler => Router
   */

  async configure(conf: AppConfigureConf) {
    this.services = {};
    this.routers = conf.routers.slice();
    this.logger = conf.logger;
    this.initialize();

    // - Step 1 : load services and configure them
    for (let service of conf.services) {
      service.__smuid__ = "" + uniqId++;
      let serviceConf = service.__smcfgr__
        ? service.__smcfgr__(conf.config)
        : [conf.config];
      this.services[service.__smuid__] = new service(...serviceConf);
    }

    let curService;
    for (let name of Object.keys(this.services)) {
      curService = this.services[name];
      if (typeof curService.initialize === "function") {
        await curService.initialize();
      }
      if (typeof curService.integrate === "function") {
        curService.integrate(this.app);
      }
    }

    // - Step 2 : configure middlewares
    conf.middlewares.forEach(mdw => {
      this.app.use((req, res, next) => {
        mdw.handle(req, res.locals.app, next);
      });
    });

    // - Step 3 : configure controllers
    conf.controllers.forEach(obj => {
      const metadata = MetadataCollector.getMetadataForObject(obj);
      conf.routers.forEach(router => router.receiveMetadata(obj, metadata));
    });

    // - Step 4 : integrate routers with Express
    conf.routers.forEach(router => {
      router.integrate(this.app);
    });

    return this;
  }

  getService(constructor: any) {
    return this.services[constructor.__smuid__];
  }

  getRouter(at: number) {
    return this.routers[at];
  }

  run(port: number) {
    this.app.listen(port, () => {
      console.log("Server is running");
    });
  }
}

export default new App();
