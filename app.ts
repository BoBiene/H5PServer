require("source-map-support").install();
import express = require("express");
import i18next from "i18next";
import i18nextHttpMiddleware from "i18next-http-middleware";
import i18nextFsBackend from "i18next-fs-backend";
import path = require("path");
import config from "config";
import bodyParser from "body-parser";

import h5pStartup from "./h5p/h5pServer";
import h5pApi from "./routes/h5pApi";
import Context from "./Context";
import { LayoutDisplay, ErrorModel } from "./models/types";

import InitAuthentication from "./routes/Authentication";
import AddRequestLogger from "./requestLogger";

process.on("unhandledRejection", console.log);

const start = async () => {
  const translationFunction = await i18next
    .use(i18nextFsBackend)
    .use(i18nextHttpMiddleware.LanguageDetector) // This will add the
    // properties language and languages to the req object.
    // See https://github.com/i18next/i18next-http-middleware#adding-own-detection-functionality
    // how to detect language in your own fashion. You can also choose not
    // to add a detector if you only want to use one language.
    .init({
      detection: {
        // order and from where user language should be detected
        order: ["querystring", "cookie", "header"],

        // keys or params to lookup language from
        lookupQuerystring: "lng",
        lookupCookie: "i18next",
        lookupHeader: "accept-language",
        lookupHeaderRegex: /(([a-z]{2})-?([A-Z]{2})?)\s*;?\s*(q=([0-9.]+))?/gi,
        lookupSession: "lng",
        lookupPath: "lng",
        lookupFromPathIndex: 0,
      },
      backend: {
        loadPath: "assets/translations/{{ns}}/{{lng}}.json",
      },
      debug: process.env.DEBUG && process.env.DEBUG.includes("i18n"),
      defaultNS: "server",
      fallbackLng: "en",
      ns: [
        "client",
        "copyright-semantics",
        "metadata-semantics",
        "mongo-s3-content-storage",
        "s3-temporary-storage",
        "server",
        "storage-file-implementations",
      ],
      preload: ["en", "de"], // If you don't use a language detector of
      // i18next, you must preload all languages you want to use!
    });

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

  // The i18nextExpressMiddleware injects the function t(...) into the req
  // object. This function must be there for the Express adapter
  // (H5P.adapters.express) to function properly.
  app.use(i18nextHttpMiddleware.handle(i18next));

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
