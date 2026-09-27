import assert from "node:assert/strict";
import { EDITOR_FIELDS, propertyEditorSchema } from "../src/lib/property-editor";

const sample = {
  ...Object.fromEntries(EDITOR_FIELDS.map((key) => [key, ""])),
  slug: "test", updated_at: "2026-09-27T00:00:00Z", reference: "TEST",
  title: "Test", type: "villa", listing: "vente", city: "Marrakech",
  pool: "false", exclusivity: "false", published: "false",
};
const parsed = propertyEditorSchema.parse(sample);
assert.equal(parsed.bedrooms, null);
assert.equal(parsed.surface, null);
assert.equal(parsed.price_eur, 0);
assert.equal(propertyEditorSchema.parse({ ...sample, bedrooms: "0" }).bedrooms, 0);
assert.equal(propertyEditorSchema.parse({ ...sample, bedrooms: "4" }).bedrooms, 4);
assert.equal(propertyEditorSchema.safeParse({ ...sample, bedrooms: "-1" }).success, false);
assert.equal(propertyEditorSchema.safeParse({ ...sample, bedrooms: "2.5" }).success, false);
assert.equal(propertyEditorSchema.safeParse({ ...sample, bedrooms: "abc" }).success, false);
assert.equal(propertyEditorSchema.safeParse({ ...sample, images: "https://evil.example/pic.jpg" }).success, false);
assert.equal(propertyEditorSchema.safeParse({ ...sample, images: "https://www.marrakechrealty.com/photo.jpg" }).success, true);
assert.deepEqual(propertyEditorSchema.parse({ ...sample, features: "Piscine\n\nTerrasse" }).features, ["Piscine", "Terrasse"]);
assert.equal("owner_email" in propertyEditorSchema.parse({ ...sample, owner_email: "ignored" }), false);
console.log("PASS: empty values, zero, numerical validation, photos, equipment and field whitelist");
