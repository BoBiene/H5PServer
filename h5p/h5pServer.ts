import { Router } from "express";
import { H5PConfig, adapters, fsImplementations } from "h5p-nodejs-library";
import path = require("path");
import fs = require("fs");
import expressRoutes from "../routes/h5p";
import setupPlayer from "./SetupPlayer";
import setupEditor from "./SetupEditor";
import * as fileUpload from "express-fileupload";
import * as config from "config";

export default async function (router: Router) {
  const h5pConfig = await new H5PConfig(
    new fsImplementations.JsonStorage(path.resolve("config/h5p.config.json"))
  ).load();

  const h5pEditor = setupEditor(h5pConfig);
  const h5pPlayer = setupPlayer(h5pConfig, h5pEditor);

  router.use(
    fileUpload({
      limits: { fileSize: h5pEditor.config.maxFileSize },
    })
  );

  const pathToCore = path.resolve(config.get("h5p.path.core")); // the path on the local disc where the files of the JavaScript client of the player are stored
  const pathToEditor = path.resolve(config.get("h5p.path.editor")); // the path on the local disc where the files of the JavaScript client of the editor are stored

  if (!fs.existsSync(pathToCore)) {
    console.error(
      `Missing H5P core lib, please download the newest core (https://github.com/h5p/h5p-php-library/) and unzip it to ${pathToCore}`
    );
    process.exit(1);
  }

  if (!fs.existsSync(pathToEditor)) {
    console.error(
      `Missing H5P editor lib, please download the newest editor (https://github.com/h5p/h5p-editor-php-library/) and unzip it to ${pathToEditor}`
    );
    process.exit(1);
  }

  router.use(
    "/:UserToken/",
    adapters.express(h5pEditor, pathToCore, pathToEditor)
  );

  const h5pRoutes = expressRoutes(h5pEditor, h5pPlayer);
  router.use("/:UserToken/", h5pRoutes);
}
