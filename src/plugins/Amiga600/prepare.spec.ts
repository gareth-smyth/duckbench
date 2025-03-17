import EnvironmentSetup from "../../builder/EnvironmentSetup";
import { Amiga600 } from "../../amigas";
import A600, { A600PluginConfig } from "./index";

const environmentSetup = new EnvironmentSetup();

const config: A600PluginConfig = {
  type: "system",
  name: "Amiga600",
  optionValues: {
    processor: "68060",
    fastMem: 4096,
    chipMem: 1024,
    rom: "2.05",
  },
};

it("sets the system details", async () => {
  const amiga600 = new A600();
  amiga600.prepare(config, environmentSetup);

  expect(environmentSetup.amigaDefinition).toEqual({
    ...Amiga600,
    cpu: "68060",
    kickstart: "2.05",
    fastMemory: 4096,
  });
});
