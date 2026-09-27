import assert from "node:assert/strict";
import { propertyPricePair, sourcePriceRange } from "../src/lib/property-price";
import { matchesPropertySearch } from "../src/lib/inventory-search";

assert.equal(propertyPricePair(0).primary, "Prix sur demande");
assert.equal(propertyPricePair(100).secondary, "Prix MAD à confirmer");
assert.match(propertyPricePair(100, 1100).primary, /€/);
assert.match(propertyPricePair(100, 1100).secondary, /MAD/);
assert.equal(propertyPricePair(0, 1100).secondary, "Prix EUR à confirmer");
assert.equal(sourcePriceRange("399/490 € / nuit", "4389/5390 Dhs / nuit")?.primary, "399–490 € / nuit");
assert.equal(sourcePriceRange("160_200 € / nuit", "1760-2200 Dhs / nuit")?.secondary, "1760–2200 Dhs / nuit");
assert.equal(sourcePriceRange("junk", "4389 Dhs"),null);
assert(matchesPropertySearch("gueliz villa", ["Villa lumineuse", "Guéliz"]));
assert(matchesPropertySearch("l ourika", ["Route de l’Ourika"]));
assert(!matchesPropertySearch("villa targa", ["Villa", "Guéliz"]));
assert(matchesPropertySearch("VE25422", ["VE25422"]));
console.log("Price and inventory search checks passed");
