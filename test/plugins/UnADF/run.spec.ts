import UnADF from "../../../src/plugins/UnADF/index.js";

const communicator = {
  copy: vi.fn(),
  cd: vi.fn(),
  run: vi.fn(),
  delete: vi.fn(),
  protect: vi.fn(),
};
const callback = "aCallback";
const options = "options";

it("copies the source file to the duckbench drive", async () => {
  const unADF = new UnADF();
  await unADF.run(
    "a:",
    "file.adf",
    "b:disks/",
    "somewhere:",
    options,
    communicator,
    callback,
  );

  expect(communicator.copy).toHaveBeenCalledWith("a:file.adf", "duckbench:");
});

it("changes directory to the unADF folder", async () => {
  const unADF = new UnADF();
  await unADF.run(
    "a:",
    "file.adf",
    "b:disks/",
    "somewhere:",
    options,
    communicator,
    callback,
  );

  expect(communicator.cd).toHaveBeenCalledWith("somewhere:UnADF");
});

it("extracts the ADF to the requested folder", async () => {
  const unADF = new UnADF();
  await unADF.run(
    "a:",
    "file.adf",
    "b:disks/",
    "somewhere:",
    options,
    communicator,
    callback,
  );

  expect(communicator.run).toHaveBeenCalledWith(
    "unadf duckbench:file.adf DEST=b:disks/",
    options,
    callback,
    /Saved \d* files/,
  );
});

it("un-protects the temp ADF", async () => {
  const unADF = new UnADF();
  await unADF.run(
    "a:",
    "file.adf",
    "b:disks/",
    "somewhere:",
    options,
    communicator,
    callback,
  );

  expect(communicator.protect).toHaveBeenCalledWith("duckbench:file.adf", {
    d: true,
    ADD: true,
  });
});

it("deletes the temp ADF", async () => {
  const unADF = new UnADF();
  await unADF.run(
    "a:",
    "file.adf",
    "b:disks/",
    "somewhere:",
    options,
    communicator,
    callback,
  );

  expect(communicator.delete).toHaveBeenCalledWith("duckbench:file.adf");
});

it("throws an error when the copy command throws an error", async () => {
  communicator.copy.mockImplementation(() => {
    throw new Error("copy error");
  });

  const unADF = new UnADF();
  await expect(
    unADF.run(
      "a:",
      "file.adf",
      "b:disks/",
      "somewhere:",
      options,
      communicator,
      callback,
    ),
  ).rejects.toThrow("copy error");
});

it("throws an error when the cd command throws an error", async () => {
  communicator.cd.mockImplementation(() => {
    throw new Error("cd error");
  });

  const unADF = new UnADF();
  await expect(
    unADF.run(
      "a:",
      "file.adf",
      "b:disks/",
      "somewhere:",
      options,
      communicator,
      callback,
    ),
  ).rejects.toThrow("cd error");
});

it("throws an error when the unADF command throws an error", async () => {
  communicator.run.mockImplementation(() => {
    throw new Error("unADF error");
  });

  const unADF = new UnADF();
  await expect(
    unADF.run(
      "a:",
      "file.adf",
      "b:disks/",
      "somewhere:",
      options,
      communicator,
      callback,
    ),
  ).rejects.toThrow("unADF error");
});

it("throws an error when the protect command throws an error", async () => {
  communicator.protect.mockImplementation(() => {
    throw new Error("protect error");
  });

  const unADF = new UnADF();
  await expect(
    unADF.run(
      "a:",
      "file.adf",
      "b:disks/",
      "somewhere:",
      options,
      communicator,
      callback,
    ),
  ).rejects.toThrow("protect error");
});

it("throws an error when the delete command throws an error", async () => {
  communicator.delete.mockImplementation(() => {
    throw new Error("delete error");
  });

  const unADF = new UnADF();
  await expect(
    unADF.run(
      "a:",
      "file.adf",
      "b:disks/",
      "somewhere:",
      options,
      communicator,
      callback,
    ),
  ).rejects.toThrow("delete error");
});
