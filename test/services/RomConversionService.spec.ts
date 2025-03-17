import { closeSync, existsSync, openSync, readFileSync, writeSync } from "fs";

import RomConversionService from "../../src/services/RomConversionService.js";
import { vi } from "vitest";

describe("realToEmulator", () => {
  it("fails and closes open files when an input file does not exist", () => {
    const fd = "ABCDEFGH";
    vi.mocked(readFileSync)
      .mockReturnValueOnce(fd)
      .mockImplementationOnce(() => {
        throw new Error();
      });
    RomConversionService.realToEmulator(
      ["file1", "file2"],
      "out",
      true,
      "256kb",
      8,
    );
    expect(openSync).toHaveBeenCalledTimes(0);
    expect(closeSync).toHaveBeenCalledTimes(0);
  });

  it("does not write output file when it exists and force is false", () => {
    const fd1 = "ABCDEFGH";
    const fd2 = "IJKLMNOP";
    vi.mocked(readFileSync).mockReturnValueOnce(fd1).mockReturnValueOnce(fd2);
    vi.mocked(existsSync).mockReturnValueOnce(true);

    RomConversionService.realToEmulator(
      ["file1", "file2"],
      "out",
      false,
      "256kb",
      8,
    );

    expect(openSync).toHaveBeenCalledTimes(0);
    expect(writeSync).toHaveBeenCalledTimes(0);
  });

  describe("when it writes a file", () => {
    const file1 = "ABCDEFGH";
    const file2 = "IJKLMNOP";
    const outputFile: string[] = [];

    beforeEach(() => {
      outputFile.length = 0;
      vi.mocked(existsSync).mockReturnValueOnce(true);
      vi.mocked(readFileSync)
        .mockReturnValueOnce(file1)
        .mockReturnValueOnce(file2);
      vi.mocked(openSync).mockReturnValueOnce(11);
      vi.mocked(writeSync).mockImplementation(
        (
          fd: number,
          buffer: string,
          offset?: number | null | undefined,
          length?: number | null | undefined,
        ) => {
          if (fd === 11) {
            outputFile.push(buffer.substr(offset!, length));
          }
          return fd;
        },
      );
    });

    it("writes output file when it exists and force is true", () => {
      RomConversionService.realToEmulator(
        ["file1", "file2"],
        "out",
        true,
        "256kb",
        16,
      );

      expect(closeSync).toHaveBeenCalledWith(11);
      expect(openSync).toHaveBeenCalledTimes(1);
      expect(vi.mocked(writeSync).mock.calls.length).toBe(16);
    });

    it("merges input files byte swapped when total input size equals output size", () => {
      RomConversionService.realToEmulator(
        ["file1", "file2"],
        "out",
        true,
        "256kb",
        16,
      );

      expect(outputFile.join("")).toBe("BAJIDCLKFENMHGPO");
    });

    it("merges and repeats input files byte swapped when total input size is less than output size", () => {
      RomConversionService.realToEmulator(
        ["file1", "file2"],
        "out",
        true,
        "512kb",
        16,
      );

      expect(outputFile.join("")).toBe("BAJIDCLKFENMHGPOBAJIDCLKFENMHGPO");
    });

    it("merges and shortens input files byte swapped when total input size is greater than output size", () => {
      RomConversionService.realToEmulator(
        ["file1", "file2"],
        "out",
        true,
        "256kb",
        8,
      );

      expect(outputFile.join("")).toBe("BAJIDCLK");
    });
  });
});

describe("emulatorToReal", () => {
  const fd1 = "ABCDEFGH";
  const fd2: string[] = [];

  beforeEach(() => {
    fd2.length = 0;
    vi.mocked(readFileSync).mockReturnValueOnce(fd1);
    vi.mocked(openSync).mockReturnValueOnce(fd2);
    vi.mocked(writeSync).mockImplementation((fd, buffer, offset, length) => {
      fd.push(buffer.substr(offset, length));
    });
  });

  it("writes the byte swapped file", () => {
    RomConversionService.emulatorToReal(
      "file1",
      "file2",
      false,
      "256kb",
      false,
      8,
    );

    expect(fd2.join("")).toBe("BADCFEHG");
  });

  it("repeats the output when output size is bigger than input", () => {
    RomConversionService.emulatorToReal(
      "file1",
      "file2",
      false,
      "1mb",
      false,
      8,
    );

    expect(fd2.join("")).toBe("BADCFEHGBADCFEHGBADCFEHGBADCFEHG");
  });

  it("writes the byte swapped file when output is smaller than input", () => {
    RomConversionService.emulatorToReal(
      "file1",
      "file2",
      false,
      "128kb",
      false,
      8,
    );

    expect(fd2.join("")).toBe("BADC");
  });

  it("splits the file when requested", () => {
    const fd3 = [];
    const fd4 = [];
    vi.mocked(openSync)
      .mockReset()
      .mockReturnValueOnce(fd3)
      .mockReturnValueOnce(fd4);

    RomConversionService.emulatorToReal(
      "file1",
      "file2",
      false,
      "128kb",
      true,
      8,
    );

    expect(fd3.join("")).toBe("BAFE");
    expect(fd4.join("")).toBe("DCHG");
  });

  it("writes the byte swapped file when file exists but force is true", () => {
    vi.mocked(existsSync).mockReturnValueOnce(true);
    RomConversionService.emulatorToReal(
      "file1",
      "file2",
      true,
      "256kb",
      false,
      8,
    );

    expect(fd2.join("")).toBe("BADCFEHG");
  });

  it("does not write the file when first file exists and force is false", () => {
    vi.mocked(existsSync).mockReturnValueOnce(true);
    RomConversionService.emulatorToReal(
      "file1",
      "file2",
      false,
      "256kb",
      false,
      8,
    );

    expect(writeSync).toHaveBeenCalledTimes(0);
  });

  it("does not write files when second output file exists and force is false", () => {
    vi.mocked(existsSync).mockReturnValueOnce(false).mockReturnValueOnce(true);
    RomConversionService.emulatorToReal(
      "file1",
      "file2",
      false,
      "256kb",
      true,
      8,
    );

    expect(writeSync).toHaveBeenCalledTimes(0);
  });
});
