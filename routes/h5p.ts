import express = require("express");
import H5P from "h5p-nodejs-library";
import Context from "../Context";
import { H5PStartPageModel, LayoutDisplay } from "../models/types";
import { postTestContent } from "../backend/BackendAPI";
import { Fail } from "./Authentication";
import config from "config";

export default function (
  h5pEditor: H5P.H5PEditor,
  h5pPlayer: H5P.H5PPlayer
): express.Router {
  const router = express.Router();

  router.get(
    `${h5pEditor.config.playUrl}/:contentId`,
    async (req, res, next) => {
      try {
        const h5pPage = await h5pPlayer.render(req.params.contentId);
        res.render("h5p-player", h5pPage);
      } catch (error) {
        next(error);
      }
    }
  );

  router.use((req, res, next) => {
    const context = Context.current();
    if (!context.User.canAccessEditor) {
      next(Fail("Access denied", 403));
    } else {
      next();
    }
  });
  if (config.get("h5p.startPage")) {
    router.get("/", async (req, res) => {
      const context = Context.current();
      const contentIds = await h5pEditor.contentManager.listContent();
      const contentObjects = await Promise.all(
        contentIds.map(async (id) => ({
          content: await h5pEditor.contentManager.getContentMetadata(
            id,
            context.User
          ),
          id,
        }))
      );

      const model: H5PStartPageModel = {
        title: "H5P NodeJs Demo",
        baseUrl: context.getBaseUrl(),
        playUrl: h5pEditor.config.playUrl,
        downloadUrl: h5pEditor.config.downloadUrl,
        contentObjects: contentObjects,
        User: context.User,
        display: config.get("display") as LayoutDisplay,
      };

      res.render("h5p-startpage", model);
    });
  }
  router.get("/edit/:contentId", async (req, res) => {
    const lang = req["i18n"]?.language ?? "en";
    const page = await h5pEditor.render(req.params.contentId, lang);
    res.render("h5p-editor", page);
  });

  router.post("/edit/:contentId", async (req, res) => {
    const context = Context.current();

    const content = await h5pEditor.saveOrUpdateContentReturnMetaData(
      req.params.contentId.toString(),
      req.body.params.params,
      req.body.params.metadata,
      req.body.library,
      context.User
    );
    await postTestContent(context.User, content);
    const contentId = content.id;
    res.send(JSON.stringify({ contentId }));
    res.status(200).end();
  });

  router.get("/new", async (req, res) => {
    const lang = req["i18n"]?.language ?? "en";
    const page = await h5pEditor.render(undefined, lang);
    res.render("h5p-editor", page);
  });

  router.post("/new", async (req, res, next) => {
    if (
      !req.body.params ||
      !req.body.params.params ||
      !req.body.params.metadata ||
      !req.body.library ||
      !req["user"]
    ) {
      next(Fail("Malformed request", 400));
    } else {
      const context = Context.current();
      const content = await h5pEditor.saveOrUpdateContentReturnMetaData(
        undefined,
        req.body.params.params,
        req.body.params.metadata,
        req.body.library,
        req["user"]
      );
      await postTestContent(context.User, content);
      const contentId = content.id;
      res.send(JSON.stringify({ contentId }));
      res.status(200).end();
    }
  });

  router.get("/delete/:contentId", async (req, res, next) => {
    try {
      await h5pEditor.deleteContent(req.params.contentId, req["user"]);
    } catch (error) {
      next(
        Fail(
          `Error deleting content with id ${req.params.contentId}: ${error.message}<br/><a href="javascript:window.location=document.referrer">Go Back</a>`,
          500
        )
      );
      return;
    }

    res.send(
      `Content ${req.params.contentId} successfully deleted.<br/><a href="javascript:window.location=document.referrer">Go Back</a>`
    );
    res.status(200).end();
  });
  return router;
}
