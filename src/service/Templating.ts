import * as express from "express";
import * as path from "path";
import * as ejs from "ejs";

class Templating {
  public viewsPath;
  constructor(config) {
    this.viewsPath = path.resolve(config.paths.views);
  }

  integrate(app: express.Application) {
    app.set("view engine", "ejs");
  }

  parse(filename, data) {
    return ejs.renderFile(path.resolve(this.viewsPath, filename), data);
  }
}

export default Templating;
