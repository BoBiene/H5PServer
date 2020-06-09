require("source-map-support").install();
import express = require("express");
import path = require("path");
import * as config from "config";
import * as bodyParser from "body-parser";

import h5pStartup from "./h5p/h5pServer";
import h5pApi from "./routes/h5pApi";
import Context from "./Context";
import { LayoutDisplay, ErrorModel } from "./models/types";

import InitAuthentication from "./routes/Authentication";
import AddRequestLogger from "./requestLogger";

process.on("unhandledRejection", console.log);

const start = async () => {
  const app = express();
  AddRequestLogger(app);
  app.use(bodyParser.json({ limit: "500mb" }));
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  Context.setup(app);

  const pathPrefix = config.get("server.pathPrefix") as string;
  const router = express.Router();

  //view engine setup
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "pug");

  router.get("/favicon.ico", (req, res) => {
    res.statusCode = 404;
    res.end();
  });

  router.use(express.static(path.join(__dirname, "public")));

  InitAuthentication(router);

  router.use("/:UserToken/api", h5pApi());

  await h5pStartup(router);

  // catch 404 and forward to error handler
  router.use((req, res, next) => {
    const err = new Error("Not Found");
    err["status"] = 404;
    next(err);
  });

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get("env") === "development") {
    router.use((err: Error, req, res, next) => {
      // eslint-disable-line @typescript-eslint/no-unused-vars
      const context = Context.current();

      const model: ErrorModel = {
        title: "Error",
        message: err.message,
        error: err,
        baseUrl: pathPrefix,
        User: context.User,
        display: config.get("display") as LayoutDisplay,
      };
      res.status(err["status"] || 500);

      res.render("error", model);
    });
  }

  // production error handler
  // no stacktraces leaked to user
  router.use((err, req, res, next) => {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    const context = Context.current();

    const model: ErrorModel = {
      title: "Error",
      message: err.message,
      error: {},
      baseUrl: pathPrefix,
      User: context.User,
      display: config.get("display") as LayoutDisplay,
    };
    res.status(err.status || 500);
    res.render("error", model);
    console.error(
      `${req.method} ${req.originalUrl}; ${res.statusCode} ${
        res.statusMessage
      }; ${JSON.stringify(err)}`
    );
  });

  app.use(pathPrefix, router);
  app.set("port", process.env.PORT || 1338);

  const server = app.listen(app.get("port"), function () {
    console.info("Express server listening on port " + server.address().port);
  });
  // server.timeout = 1000;
};

start();
