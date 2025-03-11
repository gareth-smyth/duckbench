import path from "path";
import fs from "fs";
import { vi } from "vitest";
import { BASE_DIR } from "../../../src/services/BaseDirService.js";

vi.mock("fs");

import SettingsService from "../../../src/services/SettingsService.js";

it("calls write file with the received settings", () => {
  SettingsService.saveCurrent({ a: "one" });
  expect(fs.writeFileSync).toHaveBeenCalledWith(
    path.join(BASE_DIR, "db_settings.json"),
    JSON.stringify({ a: "one" }),
  );
});
