import EnvironmentSetup from "../../builder/EnvironmentSetup.js";
import A500, { A500PluginConfig } from "./index";
import { Amiga500 } from "../../amigas";

const environmentSetup = new EnvironmentSetup();

const config: A500PluginConfig = {
  type: "system",
  name: "Amiga500",
  optionValues: {
    processor: "68040",
    fastMem: 512,
    chipMem: 1536,
    rom: "2.05",
  },
};

it("sets the system details", async () => {
  const amiga500 = new A500();
  amiga500.prepare(config, environmentSetup);

  expect(environmentSetup.amigaDefinition).toEqual({
    ...Amiga500,
    cpu: "68040",
    kickstart: "2.05",
    fastMemory: 512,
    chipMemory: 1536,
  });
});
