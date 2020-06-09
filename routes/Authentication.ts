import express = require("express");
import User from "../User";
import Context from "../Context";
import { getUser } from "../backend/BackendAPI";

export const Fail = (msg: string, statusCode: number): Error => {
  const error = new Error(msg);
  error["status"] = statusCode;
  return error;
};

export default function (router: express.Router): express.IRouter {
  const validateAuth = (req, res, next) => {
    const user = req["user"] as User;
    const context = Context.current();
    if (user === undefined) {
      console.log("User not authenticated for " + req.baseUrl);
      next(Fail("User not authenticated", 401));
    } else if (user.tenant === "") {
      console.log("User missing tenant for " + req.baseUrl);
      next(Fail("User missing tenant", 500));
    } else {
      next();
    }
  };

  router.use("/:UserToken", async (req, res, next) => {
    const context = Context.current();
    try {
      const user = await getUser(req.params.UserToken);
      if (!user) {
        console.log("User not authenticated for " + req.baseUrl);
        next(Fail("User not authenticated", 401));
      } else if (user.tenant === "") {
        console.log("User missing tenant for " + req.baseUrl);
        next(Fail("User missing tenant", 500));
      } else {
        req["user"] = user;
        context.User = user;
        next();
      }
    } catch (e) {
      console.log("Failed to validate user for " + req.baseUrl, e);
      next(Fail("Failed to authenticate user", 401));
    }
  });

  router.use(validateAuth);

  return router.all("/:UserToken");
}
