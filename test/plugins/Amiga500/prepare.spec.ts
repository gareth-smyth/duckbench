import Amiga500 from "../../../src/plugins/Amiga500/index.js";
import EnvironmentSetup from "../../../src/builder/EnvironmentSetup.js";

vi.mock("../../../src/builder/EnvironmentSetup");

const environmentSetup = new EnvironmentSetup();

const config = {
  optionValues: {
    processor: "68090",
    fastMem: "3TB",
    chipMem: "1",
    rom: "2.05",
  },
};

it("sets the system name", async () => {
  const amiga500 = new Amiga500();
  amiga500.prepare(config, environmentSetup);

  expect(environmentSetup.setSystemName).toHaveBeenCalledWith("a500");
});

it("sets the ROM", async () => {
  const amiga500 = new Amiga500();
  amiga500.prepare(config, environmentSetup);

  expect(environmentSetup.setRom).toHaveBeenCalledWith("2.05");
});

it("sets the CPU", async () => {
  const amiga500 = new Amiga500();
  amiga500.prepare(config, environmentSetup);

  expect(environmentSetup.setCPU).toHaveBeenCalledWith("68090");
});

it("sets the chip mem", async () => {
  const amiga500 = new Amiga500();
  amiga500.prepare(config, environmentSetup);

  expect(environmentSetup.setChipMem).toHaveBeenCalledWith("1");
});

it("sets the fast mem", async () => {
  const amiga500 = new Amiga500();
  amiga500.prepare(config, environmentSetup);

  expect(environmentSetup.setFastMem).toHaveBeenCalledWith("3TB");
});

it("sets the floppy", async () => {
  const amiga500 = new Amiga500();
  amiga500.prepare(config, environmentSetup);

  expect(environmentSetup.setFloppyDrive).toHaveBeenCalledWith(true);
});
