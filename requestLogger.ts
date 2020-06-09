import { Request, Response, Application, NextFunction } from "express";

export default function AddRequestLogger(app: Application) {
  const getLoggerForStatusCode = (statusCode: number) => {
    if (statusCode >= 500) {
      return console.error.bind(console);
    }
    if (statusCode >= 400) {
      return console.warn.bind(console);
    }

    return console.info.bind(console);
  };

  const logRequestStart = (req: Request, res: Response, next: NextFunction) => {
    const logChannel = `${req.method} ${req.originalUrl}`;
    console.info(logChannel);

    const cleanup = () => {
      res.removeListener("finish", logFn);
      res.removeListener("close", abortFn);
      res.removeListener("error", errorFn);
    };

    const logFn = () => {
      cleanup();
      const logger = getLoggerForStatusCode(res.statusCode);
      logger(
        logChannel +
          `; ${res.statusCode} ${res.statusMessage}; ${
            res.get("Content-Length") || 0
          }b sent`
      );
    };

    const abortFn = () => {
      cleanup();
      console.warn(logChannel + "; Request aborted by the client");
    };

    const errorFn = (err) => {
      cleanup();
      console.error(logChannel + `; Request pipeline error: ${err}`);
    };

    res.on("finish", logFn); // successful pipeline (regardless of its response)
    res.on("close", abortFn); // aborted pipeline
    res.on("error", errorFn); // pipeline internal error

    next();
  };

  app.use(logRequestStart);
}
