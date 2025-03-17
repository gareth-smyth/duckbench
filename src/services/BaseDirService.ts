/* istanbul ignore file -- @preserve */
import fs from "fs";
import path from "path";

const BASE_DIR = path.join(import.meta.dirname, "../../");
const TOOLS_DIR = path.join(BASE_DIR, "external_tools");
const CACHE_DIR = path.join(BASE_DIR, "cache");

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

if (!fs.existsSync(TOOLS_DIR)) {
  fs.mkdirSync(TOOLS_DIR);
}

export { BASE_DIR, TOOLS_DIR, CACHE_DIR };
