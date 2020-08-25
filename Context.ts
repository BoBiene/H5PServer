import httpRequestContext from "http-request-context";
import cuid from "cuid";
import express = require("express");
import User from "./User";
import path from "path";
import config from "config";

const appName = "h5pServer";

export default class Context {
  path: string;
  corrId: string | string[];
  requestTime: number;
  User: User;

  getBaseUrl(): string {
    return config.get("server.pathPrefix") + this.User?.token ?? "";
  }

  static setup(app: express.Application) {
    //httpContext.set('Context', new Context(req));

    app.use(httpRequestContext.middleware());
    app.use((req, res, next) => {
      httpRequestContext.set("Context", new Context(req));
      next();
    });
  }

  constructor(req: express.Request) {
    this.path = req.path;
    this.corrId = req.headers["x-correlation-id"] || cuid();
    this.requestTime = Date.now();
  }

  static tenantPath(basePath: string): string {
    const context = Context.current();
    const tenant = context?.User?.tenant;
    if (!tenant) throw new Error("Missing tenant!");
    return path.join(basePath, tenant);
  }
  static current(): Context {
    const context = httpRequestContext.get("Context");
    if (!context) throw new Error("Missing context!");
    return context;
  }
}
