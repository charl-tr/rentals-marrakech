import assert from "node:assert/strict";
import { cleanSelection, readSelection, writeSelection } from "../src/lib/local-selection-storage";

assert.deepEqual(cleanSelection(null), []);
assert.deepEqual(cleanSelection(["a", "a", null, 42, "", "b"]), ["a", "b"]);
assert.deepEqual(cleanSelection(["a", "b", "c", "d"], 3), ["a", "b", "c"]);
assert.deepEqual(readSelection("server"), [], "Server rendering must not access storage");
const values = new Map<string, string>();
Object.defineProperty(globalThis, "window", { configurable: true, value: {
  localStorage: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  },
} });
assert.equal(writeSelection("favorites", ["a", "b"]), true);
assert.deepEqual(readSelection("favorites"), ["a", "b"]);
values.set("broken", "not-json");
assert.deepEqual(readSelection("broken"), []);
Object.defineProperty(window, "localStorage", { configurable: true, get: () => { throw new Error("Storage denied"); } });
assert.equal(writeSelection("private", ["a", "b"]), false);
assert.deepEqual(readSelection("private"), ["a", "b"], "Refused storage must retain this page's selection");
writeSelection("private", []);
assert.deepEqual(readSelection("private"), [], "Clear must also clear the in-memory fallback");
Reflect.deleteProperty(globalThis, "window");
console.log("PASS: selection validation, persistence, corrupt storage, private-mode fallback and clear");
