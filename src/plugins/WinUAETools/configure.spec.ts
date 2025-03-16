import WinUAETools from "./index.js";

it("returns RedirectInputFile as a dependency", () => {
  const patch = new WinUAETools();
  const config = patch.configure();

  expect(config).toEqual([{ name: "RedirectInputFile" }]);
});
