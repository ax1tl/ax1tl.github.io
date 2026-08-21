// generate.js
// Reads tracks.json + template.html, writes /listen/<slug>/index.html for each track.
// Run with: node generate.js
// No dependencies needed - uses only built-in Node modules.

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://ax1tl.online'; // no trailing slash

const tracksPath = path.join(__dirname, 'tracks.json');
const templatePath = path.join(__dirname, 'template.html');
const outDir = path.join(__dirname, 'listen');

const tracks = JSON.parse(fs.readFileSync(tracksPath, 'utf8'));
const template = fs.readFileSync(templatePath, 'utf8');

// Basic HTML-attribute escaping so titles/descriptions with quotes don't break tags
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Wipe the output dir first so removed/renamed tracks don't leave
// stale, still-live pages behind.
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

for (const track of tracks) {
  const { slug, title, description, audio, image } = track;

  if (!slug || !title || !audio) {
    console.warn(`Skipping track missing required fields (slug/title/audio):`, track);
    continue;
  }

  const ogUrl = `${SITE_URL}/listen/${slug}/`;
  const imagePath = image || '/images/icon.png'; // site-relative, used for the CSS background
  const ogImage = `${SITE_URL}${imagePath}`; // full URL, required for social preview cards

  const html = template
    .split('{{TITLE}}').join(escapeHtml(title))
    .split('{{DESCRIPTION}}').join(escapeHtml(description || ''))
    .split('{{OG_URL}}').join(ogUrl)
    .split('{{OG_IMAGE}}').join(ogImage)
    .split('{{IMAGE_PATH}}').join(escapeHtml(imagePath))
    .split('{{AUDIO_SRC}}').join(escapeHtml(audio));

  const trackDir = path.join(outDir, slug);
  fs.mkdirSync(trackDir, { recursive: true });
  fs.writeFileSync(path.join(trackDir, 'index.html'), html);

  console.log(`Built /listen/${slug}/index.html`);
}

console.log(`\nDone. ${tracks.length} page(s) generated.`);