import path from "path";

import RecommendedPartition from "../../../src/plugins/RecommendedPartition/index.js";

vi.mock("../../../src/services/HardDriveService");

import HardDriveService from "../../../src/services/HardDriveService.js";

it("creates an RDB and attaches it to the environment", async () => {
  const environmentSetup = {
    executionFolder: "some folder",
    attachHDF: vi.fn(),
  };
  const partition = new RecommendedPartition();
  await partition.prepare({ optionValues: { size: 100 } }, environmentSetup);

  expect(HardDriveService.createRDB).toHaveBeenCalledTimes(1);

  const expectedLocation = path.join("some folder", "NewWorkbench.hdf");
  const expectedOptions = [{ driveName: "DH0", fileSystem: "pfs", size: 100 }];
  expect(HardDriveService.createRDB).toHaveBeenCalledWith(
    expectedLocation,
    100,
    expectedOptions,
  );

  expect(environmentSetup.attachHDF).toHaveBeenCalledTimes(1);
  expect(environmentSetup.attachHDF).toHaveBeenCalledWith(
    "DH0",
    expectedLocation,
  );
});

describe("large hard drive set up", () => {
  it("creates an RDB and attaches it to the environment", async () => {
    const environmentSetup = {
      executionFolder: "some folder",
      attachHDF: vi.fn(),
    };
    const partition = new RecommendedPartition();
    await partition.prepare({ optionValues: { size: 5000 } }, environmentSetup);

    expect(HardDriveService.createRDB).toHaveBeenCalledTimes(1);

    const expectedLocation = path.join("some folder", "NewWorkbench.hdf");
    const expectedOptions = [
      { driveName: "DH0", fileSystem: "pfs", size: 300 },
      { driveName: "DH1", fileSystem: "pfs", size: 4700 },
    ];
    expect(HardDriveService.createRDB).toHaveBeenCalledWith(
      expectedLocation,
      5000,
      expectedOptions,
    );

    expect(environmentSetup.attachHDF).toHaveBeenCalledTimes(1);
    expect(environmentSetup.attachHDF).toHaveBeenCalledWith(
      "DH0",
      expectedLocation,
    );
  });
});
