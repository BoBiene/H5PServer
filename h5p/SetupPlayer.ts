import { fs, H5PConfig, H5PEditor, H5PPlayer } from "h5p-nodejs-library";
import * as path from "path";
import renderer from "./../models/playerModelRenderer";
import UrlGenerator from "./UrlGenerator";
import { stringify } from "querystring";

export default function (config: H5PConfig, editor: H5PEditor): H5PPlayer {
  const h5pPlayer = new H5PPlayer(
    editor.libraryStorage,
    editor.contentStorage,
    config,
    null,
    [],
    new UrlGenerator(config)
  );

  h5pPlayer.setRenderer(renderer);

  return h5pPlayer;
}
