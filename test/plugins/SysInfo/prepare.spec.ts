import AminetService from "../../../src/services/AminetService.js";
vi.mock("../../../src/services/AminetService");

import SysInfo from "../../../src/plugins/SysInfo/index.js";

it("downloads the SysInfo archive", async () => {
  const sysInfo = new SysInfo();
  await sysInfo.prepare();

  expect(AminetService.download).toHaveBeenCalledTimes(1);
  expect(AminetService.download).toHaveBeenCalledWith("util/moni/SysInfo.lha");
});
