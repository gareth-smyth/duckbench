import EnvironmentSetup from "../../builder/EnvironmentSetup";
import { AmigaCD32 } from "../../amigas";
import CD32, { CD32PluginConfig } from "./index";

const environmentSetup = new EnvironmentSetup();

const config: CD32PluginConfig = {
  type: "system",
  name: "AmigaCD32",
  optionValues: {
    rom: "3.2",
    processor: "68060",
    fastMem: 65536,
  },
};

it("sets the system details", async () => {
  const cd32 = new CD32();
  cd32.prepare(config, environmentSetup);

  expect(environmentSetup.amigaDefinition).toEqual({
    ...AmigaCD32,
    cpu: "68060",
    kickstart: "3.2",
    fastMemory: 65536,
  });
});
