import LhaService from "../../../src/services/LhaService.js";
import path from "path";
import { existsSync, readFileSync, unlinkSync } from "fs";
import { vi } from "vitest";

beforeAll(() => {
  vi.unmock("node:fs");
});

const TEMP_FILE_PATH = import.meta.dirname;

function cleanTemp() {
  for (let index = 1; index < 4; index++) {
    const fileName = path.join(TEMP_FILE_PATH, `test${index}.txt`);
    if (existsSync(fileName)) {
      unlinkSync(fileName);
    }
  }
}

beforeEach(() => {
  cleanTemp();
});

afterEach(() => {
  cleanTemp();
});

it("extracts a file", () => {
  LhaService.extract(
    path.join(import.meta.dirname, "test.lha"),
    import.meta.dirname,
  );

  const buffer1 = readFileSync(path.join(TEMP_FILE_PATH, "test1.txt"));
  expect(buffer1.toString()).toEqual("\n");

  const buffer2 = readFileSync(path.join(TEMP_FILE_PATH, "test2.txt"));
  expect(buffer2.toString()).toEqual("Hi\n");

  const buffer3 = readFileSync(path.join(TEMP_FILE_PATH, "test3.txt"));
  expect(buffer3.toString()).toEqual(
    "Hi there this is some longer test that is used to test the ecoding level 5.\n",
  );
});

it("does not extract -lh1- method file", () => {
  expect(() => {
    LhaService.extract(
      path.join(import.meta.dirname, "test-no-good-method.lha"),
      import.meta.dirname,
    );
  }).toThrow("Could not decode method -lh1- on file test1.txt");
});

it("does not extract header level 0", () => {
  expect(() => {
    LhaService.extract(
      path.join(import.meta.dirname, "test-no-good-header-level.lha"),
      import.meta.dirname,
    );
  }).toThrow("Could not decode header level 0");
});
