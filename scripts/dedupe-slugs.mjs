import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'src', 'data', 'dalat.json');
const backupPath = dataPath + '.bak';

if (!fs.existsSync(dataPath)) {
  console.error('Data file not found:', dataPath);
  process.exit(1);
}

const raw = fs.readFileSync(dataPath, 'utf-8');
let places;
try {
  places = JSON.parse(raw);
} catch (e) {
  console.error('Failed to parse JSON:', e);
  process.exit(1);
}

fs.writeFileSync(backupPath, raw, 'utf-8');

const slugCount = {};
let changed = 0;

for (let i = 0; i < places.length; i++) {
  const p = places[i];
  const slug = String(p.slug || '').trim();
  if (!slug) continue;
  if (!slugCount[slug]) slugCount[slug] = 0;
  slugCount[slug] += 1;
  if (slugCount[slug] > 1) {
    const newSlug = `${slug}-${slugCount[slug]}`;
    console.log(`Renaming duplicate slug: ${slug} -> ${newSlug}`);
    p.slug = newSlug;
    changed++;
  }
}

if (changed === 0) {
  console.log('No duplicate slugs found.');
  process.exit(0);
}

fs.writeFileSync(dataPath, JSON.stringify(places, null, 2), 'utf-8');
console.log(`Updated ${changed} duplicate slugs. Original backed up to ${backupPath}`);
