import assert from "node:assert/strict";
import { propertyPricePair } from "../src/lib/property-price";
import { matchesPropertySearch } from "../src/lib/inventory-search";

assert.equal(propertyPricePair(0).primary, "Prix sur demande");
assert.equal(propertyPricePair(100).secondary, "Prix MAD à confirmer");
assert.match(propertyPricePair(100, 1100).primary, /MAD/);
assert.match(propertyPricePair(100, 1100).secondary, /€/);
assert.equal(propertyPricePair(0, 1100).secondary, "Prix EUR à confirmer");
assert(matchesPropertySearch("gueliz villa", ["Villa lumineuse", "Guéliz"]));
assert(matchesPropertySearch("l ourika", ["Route de l’Ourika"]));
assert(!matchesPropertySearch("villa targa", ["Villa", "Guéliz"]));
assert(matchesPropertySearch("VE25422", ["VE25422"]));
console.log("Price and inventory search checks passed");
