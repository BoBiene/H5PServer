import express = require("express");

import Context from "../Context";
import { TestResults, postTestResult } from "../backend/BackendAPI";

export default function (): express.Router {
  const router = express.Router();

  router.get(
    "/content-user-data/:contentId/:dataType/:subContentId",
    async (req, res) => {
      res.status(200).end();
    }
  );

  router.post("/set-finished", async (req, res) => {
    const context = Context.current();
    const result = req.body as TestResults;
    await postTestResult(context.User, result);
    res.status(200).end();
  });

  return router;
}
