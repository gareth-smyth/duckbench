import path from "path";
import LhaHeader from "./LhaHeader.js";
import Decoder5 from "./Lha5Decode.js";
import Decoder0 from "./Lha0Decode.js";
import { closeSync, fstatSync, readSync, writeSync, openSync } from "fs";

export default class LhaFile {
  constructor(filename) {
    this.decoders = {
      "-lh0-": Decoder0,
      "-lh5-": Decoder5,
    };
    this.file = openSync(filename, "r");
  }

  parseHeaders() {
    this.headers = [];
    const stats = fstatSync(this.file);
    const fileSize = stats.size;
    let headerStart = 0;
    while (headerStart < fileSize - 1) {
      const header = new LhaHeader(this.file, headerStart);
      headerStart = header.endByte + 1;
      this.headers.push(header);
    }
  }

  extract(destination) {
    this.parseHeaders();
    this.headers.forEach((header) => {
      const compressedBuffer = Buffer.alloc(header.compressedFileSize, 0);
      readSync(
        this.file,
        compressedBuffer,
        0,
        compressedBuffer.length,
        header.compressedFileStart,
      );
      const DecoderClass = this.decoders[header.method];
      if (!DecoderClass) {
        throw new Error(
          `Could not decode method ${header.method} on file ${header.filename}`,
        );
      }
      const decoder = new DecoderClass(
        compressedBuffer,
        header.uncompressedFileSize,
      );
      const outBuffer = decoder.decode();
      const outFile = openSync(path.join(destination, header.filename), "w");
      writeSync(outFile, outBuffer, 0, outBuffer.length, 0);
      closeSync(outFile);
    });
  }
}
