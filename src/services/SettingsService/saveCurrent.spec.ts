import path from "path";
import { writeFileSync } from "fs";
import { BASE_DIR } from "../BaseDirService";

import { Settings } from "../../types";
import SettingsService from "./SettingsService";

it("calls write file with the received settings", () => {
  SettingsService.saveCurrent({ a: "one" } as unknown as Settings);
  expect(writeFileSync).toHaveBeenCalledWith(
    path.join(BASE_DIR, "db_settings.json"),
    JSON.stringify({ a: "one" }),
  );
});
