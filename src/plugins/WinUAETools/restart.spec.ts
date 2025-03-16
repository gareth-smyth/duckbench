import { vi } from "vitest";
import WinUAETools from "./index.js";

const communicator = { run: vi.fn() };

it("runs the winUAETools command", async () => {
  const pluginStore = {
    getPlugin: () => ({ createInput: () => "ram:some_file.txt" }),
  };
  const winUAETools = new WinUAETools();
  await winUAETools.restart("some_place:", communicator, pluginStore);

  expect(communicator.run).toHaveBeenCalledWith(
    "some_place:uaectrl",
    { REDIRECT_IN: "ram:some_file.txt" },
    undefined,
    "10) Exit UAE-Control",
  );
});

it("throws an error when the installerLG command throws an error", async () => {
  const pluginStore = {
    getPlugin: () => ({ createInput: () => "ram:some_file.txt" }),
  };
  const winUAETools = new WinUAETools();
  communicator.run.mockImplementation(() => {
    throw new Error("winUAETools error");
  });

  await expect(
    winUAETools.restart("some_place:", communicator, pluginStore),
  ).rejects.toThrow("winUAETools error");
});
