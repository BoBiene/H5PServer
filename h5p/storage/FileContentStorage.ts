import FileContentStorageBaseBase from "h5p-nodejs-library/build/src/implementation/fs/FileContentStorage";
import path from "path";
import fsExtra from "fs-extra";
import Context from "../../Context";

export default class FileContentStorage extends FileContentStorageBaseBase {
  protected getContentPath(): string {
    const directory = Context.tenantPath(this.contentPath);
    fsExtra.ensureDirSync(directory);
    return directory;
  }
}
