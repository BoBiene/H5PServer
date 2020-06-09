import ExpressH5PControllerBase from "h5p-nodejs-library/build/src/adapters/expressController";
import { Request, Response } from "express";
import Context from "../Context";

export default class ExpressH5PController extends ExpressH5PControllerBase {
  // public async getAjax(req: Request, res: Response): Promise<void> {
  //     const context = Context.current();
  //     return super.getAjax(req, res);
  // }
}
