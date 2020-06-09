import { H5PConfig } from "h5p-nodejs-library";
import {
  IIntegration,
  IEditorIntegration,
} from "h5p-nodejs-library/build/src/types";
import { Signer } from "crypto";

export default class IntegrationConfig implements IIntegration {
  ajax: {
    contentUserData: string;
    setFinished: string;
  };
  ajaxPath: string;
  contents?: any;
  editor?: IEditorIntegration;
  hubIsEnabled: boolean;
  l10n: object;
  postUserStatistics: boolean;
  saveFreq: number | boolean;
  url: string;
  user: {
    mail: string;
    name: string;
  };

  constructor(config: H5PConfig) {
    this.ajaxPath = config.baseUrl + "api";
  }
}
