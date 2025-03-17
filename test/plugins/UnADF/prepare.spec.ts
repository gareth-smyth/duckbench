import AminetService from "../../../src/services/AminetService";
vi.mock("../../../src/services/AminetService");

import UnADF from "../../../src/plugins/UnADF/index";

it("downloads the patch archive", async () => {
  const unADF = new UnADF();
  await unADF.prepare();

  expect(AminetService.download).toHaveBeenCalledTimes(1);
  expect(AminetService.download).toHaveBeenCalledWith("disk/misc/UnADF.lha");
});
