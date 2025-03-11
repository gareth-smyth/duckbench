import { MockedObject, vi } from "vitest";
import path from "path";
import "vitest-fetch-mock";
import { CACHE_DIR } from "../../src/services/BaseDirService.js";

import fs from "fs";
vi.mock("fs");
const mockedFs = fs as MockedObject<typeof fs>;

import AminetService from "../../src/services/AminetService.js";

const fileBuffer = "my_file";

it("does not download the file when it already exists", async () => {
  mockedFs.existsSync.mockReturnValueOnce(true);

  await AminetService.download("net/path");

  expect(fetch).toHaveBeenCalledTimes(0);
  expect(fs.writeFileSync).toHaveBeenCalledTimes(0);
});

it("downloads the file when it does not exist", async () => {
  mockedFs.existsSync.mockReturnValueOnce(false);
  fetchMock.mockResponseOnce(fileBuffer, { status: 200 });

  await AminetService.download("net/path/my_download.file");

  expect(fetch).toHaveBeenCalledTimes(1);
  const expectedURI = "http://aminet.net/net/path/my_download.file";
  expect(fetch).toHaveBeenCalledWith(expectedURI);
  expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
  expect(fs.writeFileSync).toHaveBeenCalledWith(
    path.join(CACHE_DIR, "my_download.file"),
    Buffer.from(fileBuffer),
  );
});

it("overrides the filename when supplied", async () => {
  mockedFs.existsSync.mockReturnValueOnce(false);
  fetchMock.mockResponseOnce(fileBuffer, { status: 200 });

  await AminetService.download("net/path/my_download.file", "my_filename.lha");

  expect(fetch).toHaveBeenCalledTimes(1);
  const expectedURI = "http://aminet.net/net/path/my_download.file";
  expect(fetch).toHaveBeenCalledWith(expectedURI);
  expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
  expect(fs.writeFileSync).toHaveBeenCalledWith(
    path.join(CACHE_DIR, "my_filename.lha"),
    Buffer.from(fileBuffer),
  );
});

it("throws an error when downloading fails", async () => {
  mockedFs.existsSync.mockReturnValueOnce(false);
  vi.mocked(fetch).mockRejectedValue("request error");

  await expect(
    AminetService.download("net/path/my_download.file"),
  ).rejects.toThrow("Failed to download my_download.file");
});

it("throws an error when downloading is not OK", async () => {
  mockedFs.existsSync.mockReturnValueOnce(false);
  vi.mocked(fetch).mockResolvedValue({
    status: 500,
    statusText: "Internal error",
  } as Response);

  await expect(
    AminetService.download("net/path/my_download.file"),
  ).rejects.toThrow(
    "Failed to fetch net/path/my_download.file: Internal error",
  );
});
