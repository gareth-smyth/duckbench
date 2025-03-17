import { vi } from "vitest";
import RedirectInputFile from "./index";
import Communicator from "../../builder/Communicator";

it("returns the default file location", async () => {
  const communicator = { echo: vi.fn() } as unknown as Communicator;
  const redirectInputFile = new RedirectInputFile();
  expect(
    await redirectInputFile.createInput(["a", "b", "c"], communicator),
  ).toEqual("ram:tmp_input");
});

it("returns the file location", async () => {
  const communicator = { echo: vi.fn() } as unknown as Communicator;
  const redirectInputFile = new RedirectInputFile();
  expect(
    await redirectInputFile.createInput(
      ["a", "b", "c"],
      communicator,
      "ram:RedirectInputFile.txt",
    ),
  ).toEqual("ram:RedirectInputFile.txt");
});

it("echos the output", async () => {
  const communicator = { echo: vi.fn() } as unknown as Communicator;
  const redirectInputFile = new RedirectInputFile();
  await redirectInputFile.createInput(
    ["a", "b", "c"],
    communicator,
    "ram:temp_input",
  );
  expect(communicator.echo).toHaveBeenCalledWith("a*nb*nc*n", {
    REDIRECT_OUT: "ram:temp_input",
  });
});
