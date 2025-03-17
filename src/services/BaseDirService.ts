/* istanbul ignore file -- @preserve */
import { existsSync, mkdirSync } from "fs";
import path from "path";

const BASE_DIR = path.join(import.meta.dirname, "../../");
const TOOLS_DIR = path.join(BASE_DIR, "external_tools");
const CACHE_DIR = path.join(BASE_DIR, "cache");

if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR, { recursive: true });
}

if (!existsSync(TOOLS_DIR)) {
  mkdirSync(TOOLS_DIR);
}

export { BASE_DIR, TOOLS_DIR, CACHE_DIR };
