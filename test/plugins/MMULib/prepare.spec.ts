import AminetService from "../../../src/services/AminetService";
vi.mock("../../../src/services/AminetService");

import MMULib from "../../../src/plugins/MMULib/index";

it("downloads the MMULib archive", async () => {
  const mmuLib = new MMULib();
  await mmuLib.prepare();

  expect(AminetService.download).toHaveBeenCalledTimes(1);
  expect(AminetService.download).toHaveBeenCalledWith("util/libs/MMULib.lha");
});
