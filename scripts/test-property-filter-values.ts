import assert from "node:assert/strict";
import { meetsMinimum, matchesPriceBucket } from "../src/lib/property-filter-values";
for (const unknown of [null, undefined, NaN]) {
  assert.equal(meetsMinimum(unknown, 4), false);
  assert.equal(matchesPriceBucket(unknown, { max: 300000 }), false);
}
assert.equal(meetsMinimum(0, 4), false);
assert.equal(meetsMinimum(4, 4), true);
assert.equal(meetsMinimum(5, 4), true);
assert.equal(matchesPriceBucket(0, { max: 300000 }), false);
assert.equal(matchesPriceBucket(300000, { max: 300000 }), true);
assert.equal(matchesPriceBucket(300000, { min: 300000, max: 600000 }), false);
assert.equal(matchesPriceBucket(300001, { min: 300000, max: 600000 }), true);
console.log("PASS: unknown numeric values, bedroom minimums and non-overlapping budget bounds");
