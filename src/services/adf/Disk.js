import { closeSync, openSync, readFileSync, writeSync } from "fs";

import Bitmap from "./Bitmap";
import DiskConfig from "./DiskConfig";
import BootBlock from "./BootBlock";
import RootBlock from "./RootBlock";

export default class Disk {
  constructor(diskFile) {
    this.diskConfig = new DiskConfig(80, 2, 11, 512, 2);

    if (!diskFile) {
      this.diskBuffer = Buffer.alloc(this.diskConfig.DISK_SIZE_BYTES, 0);
    } else {
      this.diskBuffer = readFileSync(diskFile);
    }
    this.bootBlock = new BootBlock(this.diskBuffer, this.diskConfig);
    this.rootBlock = new RootBlock(this.diskBuffer, this.diskConfig);
    this.bitmap = new Bitmap(this.diskBuffer, this.diskConfig);
  }

  initialise() {
    this.bootBlock.initialise();
  }

  makeBootable() {
    this.bootBlock.makeBootable();
  }

  format(name) {
    this.initialise();
    this.rootBlock.format(name);
    this.bitmap.format();
  }

  save(fileName) {
    const adfFile = openSync(fileName, "w");
    writeSync(adfFile, this.diskBuffer, 0, this.diskBuffer.length, 0);
    closeSync(adfFile);
  }

  list(path = "") {
    const directory = this.rootBlock.findDirectory(path);
    if (directory) {
      return directory.getFiles().map((file) => file.getName().get());
    }
    return [];
  }

  info() {
    return {
      size: this.rootBlock.getSize(),
      name: this.rootBlock.getName(),
      bootable: this.bootBlock.isBootable(),
    };
  }

  createDirectory(path, directoryName) {
    const directoryBlock = this.rootBlock.findDirectory(path);
    directoryBlock.addDirectory(directoryName);
  }

  createFile(path, source) {
    const pathPart = this.pathPart(path);
    const filePart = this.filePart(path);
    const directory = this.rootBlock.findDirectory(pathPart);
    directory.addFile(filePart, readFileSync(source));
  }

  pathPart(path) {
    const paths = path.split("/");
    if (paths.length === 1) {
      return "";
    }
    return paths.slice(0, paths.length - 1).join("/");
  }

  filePart(path) {
    const paths = path.split("/");
    if (paths.length === 1) {
      return path;
    }
    return paths[paths.length - 1];
  }
}
