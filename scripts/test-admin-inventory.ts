import assert from "node:assert/strict";
import { inventoryTransaction, inventoryStatusLabel, inventoryPrice, sortInventory } from "../src/lib/admin-inventory";
import type { Property } from "../src/data/properties";

const property = (slug: string, price: number, overrides: Partial<Property> = {}) => ({ slug, title: slug, reference: slug, price, currency: "EUR", listing: "vente", surface: 100, ...overrides }) as Property;
const rows = [property("unknown", 0), property("high", 500), property("low", 100)];
assert.equal(inventoryTransaction(undefined), "vente");
assert.equal(inventoryTransaction("location"), "location");
assert.equal(inventoryTransaction("location-saisonniere"), "location-saisonniere");
assert.equal(inventoryStatusLabel("available"), "Disponible");
assert.equal(inventoryStatusLabel("reserved", "location"), "Réservé");
assert.deepEqual(sortInventory(rows, "price-asc", {}).map((p) => p.slug), ["low", "high", "unknown"]);
assert.deepEqual(sortInventory(rows, "price-desc", {}).map((p) => p.slug), ["high", "low", "unknown"]);
assert.equal(sortInventory(rows, "requests", { low: 5 })[0].slug, "low");
assert.equal(rows[0].slug, "unknown", "Sorting must not mutate input");
assert.match(inventoryPrice(property("rent", 500, { listing: "location" })), /période à confirmer/);
assert.match(inventoryPrice(property("rent", 500, { listing: "location", priceUnit: "mois" })), /\/ mois/);
console.log("PASS: transaction, labels, sorting, unknown prices and rent units");
