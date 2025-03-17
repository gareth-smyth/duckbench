import { copyFileSync, existsSync } from "fs";
import path from "path";
import { vi } from "vitest";
import InstallWorkbench390 from "./index";

const pluginBasePath = "../../../src/plugins/InstallWorkbench390";

it("copies the installer patch", async () => {
  const installWorkbench390 = new InstallWorkbench390();
  installWorkbench390.prepare(
    { optionValues: { iso390: "a_folder" } },
    { floppyDrive: true, executionFolder: "aFolder", insertCDISO: vi.fn() },
    {
      InstallWorkbench390: [{ name: "isoLocation", value: "isoFile" }],
    },
  );

  const expectedCopyFrom = path.join(
    import.meta.dirname,
    pluginBasePath,
    "files",
    "wb3.9_install.patch",
  );
  const expectedCopyTo = path.join("aFolder", "wb3.9_install.patch");
  expect(copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it("copies the install key", async () => {
  const installWorkbench390 = new InstallWorkbench390();
  installWorkbench390.prepare(
    { optionValues: { iso390: "a_folder" } },
    { floppyDrive: true, executionFolder: "aFolder", insertCDISO: vi.fn() },
    {
      InstallWorkbench390: [
        { name: "isoLocation", value: { file: "isoFile" } },
      ],
    },
  );

  const expectedCopyFrom = path.join(
    import.meta.dirname,
    pluginBasePath,
    "files",
    "wb3.9_install_key",
  );
  const expectedCopyTo = path.join("aFolder", "wb3.9_install_key");
  expect(copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it("copies the startup sequence patch when floppy is false", async () => {
  const installWorkbench390 = new InstallWorkbench390();
  installWorkbench390.prepare(
    { optionValues: { iso390: "a_folder" } },
    { floppyDrive: false, executionFolder: "aFolder", insertCDISO: vi.fn() },
    {
      InstallWorkbench390: [
        { name: "isoLocation", value: { file: "isoFile" } },
      ],
    },
  );

  const expectedCopyFrom = path.join(
    import.meta.dirname,
    pluginBasePath,
    "files",
    "wb3.9_no_floppy_startup.patch",
  );
  const expectedCopyTo = path.join("aFolder", "wb3.9_no_floppy_startup.patch");
  expect(copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
});

it("inserts the ISO if workbench has not been cached", async () => {
  vi.mocked(existsSync).mockReturnValueOnce(false);

  const insertCDISO = vi.fn();
  const installWorkbench390 = new InstallWorkbench390();
  installWorkbench390.prepare(
    { optionValues: { iso390: "a_folder" } },
    { floppyDrive: false, executionFolder: "aFolder", insertCDISO },
    {
      InstallWorkbench390: [{ name: "isoLocation", value: "isoFile" }],
    },
  );

  expect(insertCDISO).toHaveBeenCalledWith("isoFile");
});

it("does not insert the ISO if workbench is already cached", async () => {
  vi.mocked(existsSync).mockReturnValueOnce(true);

  const insertCDISO = vi.fn();
  const installWorkbench390 = new InstallWorkbench390();
  installWorkbench390.prepare(
    { optionValues: { iso390: "a_folder" } },
    { floppyDrive: false, executionFolder: "aFolder", insertCDISO },
    {
      InstallWorkbench390: [{ name: "isoLocation", value: "isoFile" }],
    },
  );

  expect(insertCDISO).toHaveBeenCalledTimes(0);
});
