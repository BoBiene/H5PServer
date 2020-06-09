import User from "../User";
import * as rm from "typed-rest-client/RestClient";
import * as NodeCache from "node-cache";
import { IContentMetadata } from "h5p-nodejs-library/build/src/types";
import * as config from "config";

const BackendUri = config.get("backend.Uri") as string;
const backendEnabled = !!BackendUri;
const rest: rm.RestClient = new rm.RestClient("h5pFrontend", BackendUri, null, {
  socketTimeout: 3000,
});

const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

export async function getUser(token: string): Promise<User> {
  try {
    let user = myCache.get(token) as User;
    if (user === undefined) {
      const prams = { queryParameters: { params: { token: token } } };

      if (backendEnabled) {
        const request = await rest.get<User>("GetUser", prams);
        user = request.result;
      } else {
        user = {
          id: "mock",
          mail: "mock@user.com",
          tenant: "inray",
          name: "Mr. Mock",
          token: token,
          canAccessEditor: true,
          canCreateRestricted: true,
          canInstallRecommended: true,
          canUpdateAndInstallLibraries: true,
          type: "mock",
        };
      }

      myCache.set(token, user);
    }

    return user;
  } catch (e) {
    console.error("Failed to load user for token <" + token + ">", e);
    return null;
  }
}

export interface UserTestResult {
  user: User;
  result: TestResults;
}

export interface TestResults {
  contentId: number;
  score: number;
  maxScore: number;
  opend: number;
  finished: number;
}

export interface UserTestContent {
  user: User;
  content: TestContent;
}

export interface TestContent {
  id: string;
  metadata: IContentMetadata;
}

export async function postTestResult(user: User, result: TestResults) {
  if (backendEnabled)
    await rest.create<UserTestResult>("PostTestResults", {
      user: user,
      result: result,
    });
}

export async function postTestContent(user: User, content: TestContent) {
  if (backendEnabled)
    await rest.create<UserTestContent>("PostTestContent", {
      user: user,
      content: content,
    });
}
