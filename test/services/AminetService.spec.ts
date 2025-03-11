import { MockedObject, vi } from "vitest";
import path from "path";
import "../../src/globals.d.ts";

import fs from "fs";
vi.mock("fs");
const mockedFs = fs as MockedObject<typeof fs>;

import AminetService from "../../src/services/AminetService.js";

const fileBuffer = "myfile";

it("does not download the file when it already exists", async () => {
  mockedFs.existsSync.mockReturnValueOnce(true);

  await AminetService.download("net/path");

  expect(fetch).toHaveBeenCalledTimes(0);
  expect(fs.writeFileSync).toHaveBeenCalledTimes(0);
});

it("downloads the file when it does not exist", async () => {
  mockedFs.existsSync.mockReturnValueOnce(false);
  fetchMock.mockResponseOnce(fileBuffer, { status: 200 });

  await AminetService.download("net/path/mydownload.file");

  expect(fetch).toHaveBeenCalledTimes(1);
  const expectedURI = "http://aminet.net/net/path/mydownload.file";
  expect(fetch).toHaveBeenCalledWith(expectedURI);
  expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
  expect(fs.writeFileSync).toHaveBeenCalledWith(
    path.join(global.CACHE_DIR, "mydownload.file"),
    Buffer.from(fileBuffer),
  );
});

it("overrides the filename when supplied", async () => {
  mockedFs.existsSync.mockReturnValueOnce(false);
  fetchMock.mockResponseOnce(fileBuffer, { status: 200 });

  await AminetService.download("net/path/mydownload.file", "myfilename.lha");

  expect(fetch).toHaveBeenCalledTimes(1);
  const expectedURI = "http://aminet.net/net/path/mydownload.file";
  expect(fetch).toHaveBeenCalledWith(expectedURI);
  expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
  expect(fs.writeFileSync).toHaveBeenCalledWith(
    path.join(global.CACHE_DIR, "myfilename.lha"),
    Buffer.from(fileBuffer),
  );
});

it("throws an error when downloading fails", async () => {
  mockedFs.existsSync.mockReturnValueOnce(false);
  vi.mocked(fetch).mockRejectedValue("request error");

  await expect(
    AminetService.download("net/path/mydownload.file"),
  ).rejects.toThrow("Failed to download mydownload.file");
});
