import SettingsService from "./SettingsService.js";
import { vi } from "vitest";

beforeAll(() => {
  vi.unmock("node:fs");
});

it("returns settings for all plugins", async () => {
  const settings = await SettingsService.getAvailable();
  expect(settings.length).toBeGreaterThan(0);
  expect(settings[0].label).toEqual("Setup");
  expect(settings[0].settings[0].name).toEqual("emulator");
});
