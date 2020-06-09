import { IUser } from "h5p-nodejs-library";

/**
 * Example user object
 */
export default interface User extends IUser {
  mail: string;
  tenant: string;
  token: string;
  canAccessEditor: boolean;
}
