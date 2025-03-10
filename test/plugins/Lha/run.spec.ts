import Lha from "../../../src/plugins/Lha/index.js";

const communicator = { run: vi.fn() };
const callback = "aCallback";
const options = "options";

it("runs the lha command", async () => {
  const lha = new Lha();
  await lha.run("source", "dest", "lha_loc:", options, communicator, callback);

  expect(communicator.run).toHaveBeenCalledWith(
    "lha_loc:lha_68k x source dest",
    options,
    callback,
    "Operation successful.",
  );
});

it("throws an error when the installerLG command throws an error", async () => {
  communicator.run.mockImplementation(() => {
    throw new Error("lha error");
  });

  const lha = new Lha();
  await expect(
    lha.run("source", "dest", "lha_loc:", options, communicator, callback),
  ).rejects.toThrow("lha error");
});
