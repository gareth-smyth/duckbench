import EnvironmentSetup from "../../builder/EnvironmentSetup";
import { Amiga1200 } from "../../amigas";
import A1200, { A1200PluginConfig } from "./index";

const environmentSetup = new EnvironmentSetup();

const config: A1200PluginConfig = {
  type: "system",
  name: "Amiga1200",
  optionValues: {
    processor: "68060",
    fastMem: 65536,
    rom: "3.0",
  },
};

it("sets the system details", async () => {
  const amiga1200 = new A1200();
  amiga1200.prepare(config, environmentSetup);

  expect(environmentSetup.amigaDefinition).toEqual({
    ...Amiga1200,
    cpu: "68060",
    kickstart: "3.0",
    fastMemory: 65536,
  });
});
