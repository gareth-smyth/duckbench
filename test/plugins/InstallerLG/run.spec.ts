import InstallerLG from "../../../src/plugins/InstallerLG/index";

const communicator = { run: vi.fn() };
const callback = "aCallback";
const options = "options";

it("runs the patch command", async () => {
  const installerLG = new InstallerLG();
  await installerLG.run("A", options, communicator, callback, [
    "some response",
  ]);

  expect(communicator.run).toHaveBeenCalledWith(
    "InstallerLG A",
    options,
    callback,
    ["some response"],
  );
});

it("throws an error when the installerLG command throws an error", async () => {
  communicator.run.mockImplementation(() => {
    throw new Error("installerLG error");
  });

  const installerLG = new InstallerLG();
  await expect(
    installerLG.run("A", options, communicator, callback),
  ).rejects.toThrow("installerLG error");
});
