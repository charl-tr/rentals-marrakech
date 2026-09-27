import assert from "node:assert/strict";
import sharp from "sharp";
import { movePropertyImage, isExternalPropertyImage, formatPropertyUpdatedAt } from "../src/lib/property-media";
import { preparePropertyImage, readBoundedBody } from "../src/lib/property-media-processing";

async function main() {
  const photos = ["a", "b", "c"];
  assert.deepEqual(movePropertyImage(photos, 2, 0), ["c", "a", "b"]);
  assert.deepEqual(movePropertyImage(photos, 0, 2), ["b", "c", "a"]);
  assert.deepEqual(photos, ["a", "b", "c"]);
  assert.deepEqual(movePropertyImage(photos, -1, 0), photos);
  assert.equal(isExternalPropertyImage("https://www.marrakechrealty.com/wp-content/uploads/photo.jpg"), true);
  for (const url of ["https://evil.example/wp-content/uploads/a.jpg", "https://www.marrakechrealty.com.evil.example/wp-content/uploads/a.jpg", "https://user@www.marrakechrealty.com/wp-content/uploads/a.jpg", "http://www.marrakechrealty.com/wp-content/uploads/a.jpg", "https://www.marrakechrealty.com/private/a.jpg"]) assert.equal(isExternalPropertyImage(url), false);
  assert.equal(formatPropertyUpdatedAt("invalid"), null);
  assert.ok(formatPropertyUpdatedAt("2026-09-27T12:00:00Z"));
  const source = await sharp({ create: { width: 3200, height: 1600, channels: 3, background: "#a4785c" } }).jpeg().withMetadata().toBuffer();
  const output = await preparePropertyImage(source);
  const meta = await sharp(output).metadata();
  assert.equal(meta.format, "webp");
  assert.equal(meta.width, 2000);
  assert.equal(meta.height, 1000);
  assert.equal(meta.exif, undefined);
  await assert.rejects(preparePropertyImage(Buffer.from("not an image")));
  await assert.rejects(preparePropertyImage(await sharp({ create: { width: 10, height: 10, channels: 3, background: "white" } }).png().toBuffer()));
  assert.equal((await readBoundedBody(new Response("abc").body, 3)).toString(), "abc");
  await assert.rejects(readBoundedBody(new Response("abcd").body, 3));
  console.log("PASS: gallery ordering, import allowlist, timestamps, image resizing/validation, metadata stripping and bounded reads");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
