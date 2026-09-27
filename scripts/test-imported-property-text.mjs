import assert from "node:assert/strict";
import { cleanImportedHtml, isBoilerplateSummary, propertySummary } from "../src/lib/imported-property-text.mjs";

assert.equal(cleanImportedHtml('<p>L&rsquo;&oelig;uvre &Eacute;l&eacute;gante&nbsp;: 120 m&sup2;</p><p>Vue<br />Atlas</p>'), 'L’œuvre Élégante : 120 m²\n\nVue\nAtlas');
assert.equal(cleanImportedHtml('<p>Am<strong>elkis</strong> &amp; Spa</p>'), 'Amelkis & Spa');
assert.equal(cleanImportedHtml('<h2>Équipements</h2><ul><li>Piscine</li><li>Terrasse</li></ul>'), 'Équipements\n\n• Piscine\n• Terrasse');
assert.equal(cleanImportedHtml('<script>alert(1)</script><!-- comment --><p>Riad</p>'), 'Riad');
assert.equal(cleanImportedHtml('<p>Prix &#x110000;</p>'), 'Prix �');
assert.equal(cleanImportedHtml('<p>Étage\r\nVue</p>'), 'Étage\nVue');
assert.equal(isBoilerplateSummary('Caractéristiques du bienRéférence : X [Read More]'), true);
assert.equal(propertySummary('[Read More]', 'Un riad.\n\nUne terrasse.'), 'Un riad. Une terrasse.');
assert.equal(propertySummary('Un résumé valide.', 'Autre texte'), 'Un résumé valide.');
assert.ok(propertySummary('', 'Élégant '.repeat(100)).length <= 240);
console.log('PASS: entities, accents, paragraph/list breaks, inline emphasis, invalid entities and boilerplate summaries');
