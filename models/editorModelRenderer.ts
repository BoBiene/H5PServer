import { IEditorModel, IIntegration } from "h5p-nodejs-library/build/src/types";
import Context from "../Context";
import { H5PEditorLayoutModel, LayoutDisplay } from "./types";
import config from "config";

export default function render(model: IEditorModel): H5PEditorLayoutModel {
  const context = Context.current();

  const baseUrl = context.getBaseUrl();
  const integration = {
    ...model.integration,
    ajax: {
      contentUserData:
        "api/content-user-data/:contentId/:dataType/:subContentId",
      setFinished: "api/set-finished",
    },
    ajaxPath: baseUrl + "/ajax?action=",
    editor: {
      ...model.integration.editor,
      ajaxPath: baseUrl + "/ajax?action=",
      assets: {
        ...model.integration.editor.assets,
        css: [
          ...model.integration.editor.assets.css,
          config.get("server.pathPrefix") + "stylesheets/h5p.css",
        ],
      },
    },
    parameterUrl: model.urlGenerator.parameters(),
    playerUrl: model.urlGenerator.play(),
    baseUrl: baseUrl,
    postUserStatistics: true,
    saveFreq: 5000,
    user: context.User,
  };

  return {
    User: context.User,
    integration: integration,
    baseUrl: config.get("server.pathPrefix"),
    scriptUrls: [
      ...model.scripts,
      config.get("server.pathPrefix") + "scripts/editor.js",
    ],
    styleUrls: model.styles,
    title: "H5P Editor",
    display: config.get("display") as LayoutDisplay,
  };
}
