import FileLibraryStorageBase from "h5p-nodejs-library/build/src/implementation/fs/FileLibraryStorage";
import {
  ILibraryName,
  IInstalledLibrary,
} from "h5p-nodejs-library/build/src/types";
import * as fsExtra from "fs-extra";
import Context from "../../Context";

export default class FileLibraryStorage extends FileLibraryStorageBase {
  protected getLibrariesDirectory(): string {
    const context = Context.current();
    const directory = Context.tenantPath(this.librariesDirectory);
    fsExtra.ensureDirSync(directory);
    return directory;
  }

  public getLibrary(library: ILibraryName): Promise<IInstalledLibrary> {
    const context = Context.current();
    if (!context) throw new Error("missing context!");

    return super.getLibrary(library);
  }
}
