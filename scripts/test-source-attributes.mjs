import assert from 'node:assert/strict';
import { sourceAttributes, sourceNumber } from './lib/source-attributes.mjs';
const html = `<span class="price-euro">550 000 €</span><span class="price-mad"><span class="text-black"></span>5 900 000 Dhs</span>
<ul class="list-car fiche"><li><div class="left_car">Chambres</div><div class="right_car">5</div></li><li><div class="left_car">Surface terrain</div><div class="right_car label-surf-terrain">105 m²</div></li><li><div class="left_car">Surface habitable</div><div class="right_car">280 m²</div></li></ul>
<ul><li><div class="left_car">Surface terrain</div><div class="right_car">999 m²</div></li></ul>`;
assert.deepEqual(sourceAttributes(html), { price_eur:550000, price_mad:5900000, bedrooms:5, bathrooms:null, surface:280, land_surface:105 });
assert.equal(sourceNumber('m²'), null);
assert.equal(sourceNumber('105,5 m²'),105.5);
assert.equal(sourceNumber('Prix sur demande'),null);
assert.equal(sourceNumber('399/490 € / nuit'),null);
console.log('Source extraction checks passed (nested prices, related cards, missing and decimal areas).');
