import { IPlayerModel, IIntegration } from "h5p-nodejs-library/build/src/types";
import Context from "../Context";
import { H5PPlayerLayoutModel, LayoutDisplay } from "./types";
import * as config from "config";

export default function render(model: IPlayerModel): H5PPlayerLayoutModel {
  const context = Context.current();

  const baseUrl = context.getBaseUrl();

  const integration: IIntegration = {
    ...model.integration,
    ajax: {
      contentUserData:
        baseUrl + "/api/content-user-data/:contentId/:dataType/:subContentId",
      setFinished: baseUrl + "/api/set-finished",
    },
    baseUrl: baseUrl,
    postUserStatistics: true,
    saveFreq: 5000,
    user: context.User,
  };

  return {
    User: context.User,
    integration: integration,
    baseUrl: config.get("server.pathPrefix"),
    scriptUrls: model.scripts,
    styleUrls: model.styles,
    customScripts: model.customScripts,
    title: "View " + model.contentId,
    contentId: model.contentId,
    display: config.get("display") as LayoutDisplay,
  };
}
