import { existsSync, readFileSync } from "node:fs";

import SettingsService from "./SettingsService.js";
import { vi } from "vitest";

it("returns an empty object when settings file does not exist", () => {
  vi.mocked(existsSync).mockReturnValueOnce(false);
  expect(SettingsService.loadCurrent()).toEqual({});
});

it("loads and returns the settings file when it exists", () => {
  vi.mocked(existsSync).mockReturnValueOnce(true);
  vi.mocked(readFileSync).mockReturnValueOnce(JSON.stringify({ a: "one" }));
  expect(SettingsService.loadCurrent()).toEqual({ a: "one" });
});
