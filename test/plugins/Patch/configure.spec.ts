import Patch from "../../../src/plugins/Patch/index";

it("returns Lha as a dependency", () => {
  const patch = new Patch();
  const config = patch.configure();

  expect(config).toEqual([
    { name: "Lha", optionValues: { location: "duckbench:c/" } },
  ]);
});
