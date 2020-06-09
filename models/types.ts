import { IContentMetadata } from "h5p-nodejs-library";
import { IIntegration } from "h5p-nodejs-library/build/src/types";
import User from "../User";
export interface LayoutModel {
  title: string;
  User: User;
  baseUrl: string;
  display: LayoutDisplay;
}
export interface LayoutDisplay {
  hideNavBar?: boolean;
}

export interface ErrorModel extends LayoutModel {
  message: string;
  error: any;
}

export interface H5PLayoutModel extends LayoutModel {
  styleUrls?: string[];
  scriptUrls?: string[];
  scripts?: string[];
}

export interface H5PStartPageModel extends H5PLayoutModel {
  playUrl: string;
  downloadUrl: string;
  contentObjects: {
    id: string;
    content: IContentMetadata;
  }[];
}

export interface H5PEditorLayoutModel extends H5PLayoutModel {
  integration: IIntegration;
}

export interface H5PPlayerLayoutModel extends H5PLayoutModel {
  integration: IIntegration;
  contentId: string;
  customScripts: string;
}
