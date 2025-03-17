import path from "path";
import { existsSync, writeFileSync } from "fs";
import Logger from "./LoggerService";
import { CACHE_DIR } from "./BaseDirService";

export default class AminetService {
  static async download(netPath, filename = path.basename(netPath)) {
    const fullSavePath = path.join(CACHE_DIR, filename);
    if (!existsSync(fullSavePath)) {
      Logger.debug(`Downloading ${filename} from http://aminet.net/${netPath}`);
      try {
        const response = await fetch(`http://aminet.net/${netPath}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${netPath}: ${response.statusText}`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        writeFileSync(fullSavePath, buffer);
      } catch (err) {
        throw new Error(err.message || `Failed to download ${filename}`);
      }
    } else {
      Logger.debug(`Using cached version of ${filename}`);
    }
    return fullSavePath;
  }
}
