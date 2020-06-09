import UrlGeneratorBase from "h5p-nodejs-library/build/src/UrlGenerator";
import Context from "../Context";

export default class UrlGenerator extends UrlGeneratorBase {
  protected getBaseUrl = () => {
    const context = Context.current();
    return context.getBaseUrl();
  };
}
