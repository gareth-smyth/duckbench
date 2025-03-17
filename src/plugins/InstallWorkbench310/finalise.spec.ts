import { copyFileSync } from "fs";
import path from "path";

import InstallWorkbench310 from "./index";

it("copies the hard drive after installation is complete", async () => {
  const installWorkbench310 = new InstallWorkbench310();
  installWorkbench310.finalise(
    {},
    { executionFolder: "/some folder/", systemName: "A7000+" },
  );

  expect(copyFileSync).toHaveBeenCalledTimes(1);
  const expectedOutputFolder = path.join(
    process.cwd(),
    "InstallWorkbench310_A7000+.hdf",
  );
  const expectedInputFolder = path.join("/some folder/", "NewWorkbench.hdf");
  expect(copyFileSync).toHaveBeenCalledWith(
    expectedInputFolder,
    expectedOutputFolder,
  );
});
