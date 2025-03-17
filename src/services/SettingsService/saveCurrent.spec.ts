import path from "path";
import fs from "fs";
import { vi } from "vitest";
import { BASE_DIR } from "../BaseDirService";

vi.mock("fs");

import SettingsService from "./SettingsService.js";
import { Settings } from "../../types";

it("calls write file with the received settings", () => {
  SettingsService.saveCurrent({ a: "one" } as unknown as Settings);
  expect(fs.writeFileSync).toHaveBeenCalledWith(
    path.join(BASE_DIR, "db_settings.json"),
    JSON.stringify({ a: "one" }),
  );
});
