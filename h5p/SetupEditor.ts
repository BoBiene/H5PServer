import { fs, IH5PConfig, H5PEditor } from "h5p-nodejs-library";
import InMemoryStorage from "h5p-nodejs-library/build/src/implementation/InMemoryStorage";
import FileLibraryStorage from "./storage/FileLibraryStorage";
import FileContentStorage from "./storage/FileContentStorage";
import DirectoryTemporaryFileStorage from "h5p-nodejs-library/build/src/implementation/fs/DirectoryTemporaryFileStorage";
import UrlGenerator from "./UrlGenerator";
import renderer from "./../models/editorModelRenderer";
import * as path from "path";
import * as cfg from "config";

import * as defaultCopyrightSemanticsLanguageFile from "h5p-nodejs-library/build/assets/translations/copyright-semantics/en.json";
import * as defaultMetadataSemanticsLanguageFile from "h5p-nodejs-library/build/assets/translations/metadata-semantics/en.json";
import * as defaultClientLanguageFile from "h5p-nodejs-library/build/assets/translations/client/en.json";
import SimpleTranslator from "h5p-nodejs-library/build/src/helpers/SimpleTranslator";

export default function (config: IH5PConfig): H5PEditor {
  const translator = new SimpleTranslator({
    // We use a simplistic translation function that is hard-wired to
    // English if the implementation does not pass us a proper one.
    client: defaultClientLanguageFile,
    "metadata-semantics": defaultMetadataSemanticsLanguageFile,
    "copyright-semantics": defaultCopyrightSemanticsLanguageFile,
  });
  const h5pEditor = new H5PEditor(
    new InMemoryStorage(),
    {
      ...config,
    },
    new FileLibraryStorage(
      path.resolve(cfg.get("h5p.path.userdata.libraries"))
    ),
    new FileContentStorage(path.resolve(cfg.get("h5p.path.userdata.content"))),
    new DirectoryTemporaryFileStorage(
      path.resolve(cfg.get("h5p.path.userdata.temporary-storage"))
    ),
    translator.t,
    new UrlGenerator(config)
  );

  h5pEditor.setRenderer(renderer);
  return h5pEditor;
}
