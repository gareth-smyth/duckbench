import { vi, expect } from "vitest";
import { buildSerialEnabledBootDisk } from "./build-serial-enabled-boot-disk";
import ADFService from "../ADFService";

vi.mock("../ADFService");

it("creates the boot disk using the ADFService", () => {
  const fileName = "./disk.adf";
  buildSerialEnabledBootDisk(fileName);

  expect(ADFService.createBootableADF).toHaveBeenCalledWith(
    fileName,
    "SerialBoot",
  );
  expect(ADFService.createFile).toHaveBeenCalledWith(
    fileName,
    "AUX",
    expect.stringContaining("amigaFiles/file_AUX"),
  );
  expect(ADFService.createDirectory).toHaveBeenCalledWith(fileName, "", "s");
  expect(ADFService.createDirectory).toHaveBeenCalledWith(fileName, "", "t");
  expect(ADFService.createFile).toHaveBeenCalledWith(
    fileName,
    "s/startup-sequence",
    expect.stringContaining("amigaFiles/s/file_startup-sequence"),
  );
});
