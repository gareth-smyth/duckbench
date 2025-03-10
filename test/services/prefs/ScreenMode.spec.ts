import {
  ScreenMode,
  HIRES_LACED,
} from "../../../src/services/prefs/ScreenMode.js";
import IFFFile from "../../../src/services/IFF/IFFFile.js";
import { vi } from "vitest";

vi.mock("../../../src/services/IFF/IFFFile");

it("writes the file as expected", () => {
  const depth = 4;
  const screenMode = new ScreenMode(HIRES_LACED, depth);
  ScreenMode.write(screenMode, "a file name");
  const savedIFFForm = vi.mocked(IFFFile.write).mock.calls[0][1];
  expect(savedIFFForm.type).toEqual("FORM");
  expect(savedIFFForm.groupType).toEqual("PREF");
  expect(savedIFFForm.children[0].type).toEqual("PRHD");
  expect(savedIFFForm.children[1].type).toEqual("SCRM");
  expect(savedIFFForm.children[1].data.slice(16, 20).readUInt32BE()).toEqual(
    HIRES_LACED,
  );
  expect(savedIFFForm.children[1].data.slice(24, 26).readUInt16BE()).toEqual(
    depth,
  );
});
