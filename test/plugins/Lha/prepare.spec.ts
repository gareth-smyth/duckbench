import AminetService from "../../../src/services/AminetService";
vi.mock("../../../src/services/AminetService");

import Lha from "../../../src/plugins/Lha/index";

it("downloads the lha.run file", async () => {
  const lha = new Lha();
  await lha.prepare();

  expect(AminetService.download).toHaveBeenCalledTimes(1);
  expect(AminetService.download).toHaveBeenCalledWith("util/arc/lha.run");
});
