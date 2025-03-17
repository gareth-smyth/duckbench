import { existsSync } from "fs";
import path from "path";
import { CACHE_DIR } from "../../services/BaseDirService";

export default class Settings {
  get() {
    const cacheMarkerPath = path.join(CACHE_DIR, "wb390_cached");
    return {
      name: "InstallWorkbench390",
      label: "Workbench 3.9",
      settings: [
        {
          name: "isoLocation",
          type: "hostFile",
          label: "3.9 .ISO file",
          cached: existsSync(cacheMarkerPath),
        },
      ],
    };
  }
}
