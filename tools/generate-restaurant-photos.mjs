import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const dataDir = path.join(process.cwd(), "src", "data", "restaurants");
const publicDir = path.join(process.cwd(), "public", "images", "restaurants");

const countryPalette = {
  "香港": ["#b23b2e", "#7a231a"],
  "台湾": ["#2e7d5b", "#1c4f3a"],
  "タイ": ["#d98c19", "#a3620c"],
  "ベトナム": ["#1f7a99", "#134f63"],
  "韓国": ["#7a3fa0", "#4f2769"],
  "インド": ["#c76b1f", "#8f4a12"],
  "中国": ["#9c2b2b", "#6b1c1c"],
  "メキシコ": ["#1f8a5f", "#125a3d"],
  "イタリア": ["#2e6f9e", "#1c4666"],
  "トルコ": ["#a13b6b", "#6b2447"]
};

function escapeXml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Deterministic pseudo-random so re-running the generator is idempotent per slug/variant.
function seedFrom(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function makeSvg({ slug, name, category, country, variant }) {
  const [c1, c2] = countryPalette[country] || ["#6b5f56", "#443c35"];
  const seed = seedFrom(slug + variant);
  const angle = seed % 360;
  const cx = 100 + (seed % 400);
  const cy = 80 + ((seed >> 3) % 200);
  const r = 90 + ((seed >> 5) % 70);

  return `<svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(name)} placeholder photo ${variant}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${angle} 0.5 0.5)">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#g)"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" opacity="0.08"/>
  <circle cx="${600 - cx}" cy="${600 - cy}" r="${r * 0.7}" fill="#ffffff" opacity="0.06"/>
  <text x="300" y="330" text-anchor="middle" font-family="'Shippori Mincho', serif" font-size="34" fill="#ffffff" opacity="0.92">${escapeXml(name)}</text>
  <text x="300" y="368" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="15" letter-spacing="2" fill="#ffffff" opacity="0.7">${escapeXml(category.toUpperCase())}</text>
  <text x="300" y="560" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="12" letter-spacing="1.5" fill="#ffffff" opacity="0.5">PLACEHOLDER PHOTO ${variant} / ${escapeXml(country)}</text>
</svg>`;
}

const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".md"));
let updated = 0;

for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  const fullPath = path.join(dataDir, file);
  const raw = fs.readFileSync(fullPath, "utf8");
  const parsed = matter(raw);
  const { name, category, country } = parsed.data;

  const outDir = path.join(publicDir, slug);
  fs.mkdirSync(outDir, { recursive: true });

  const photoPaths = [];
  for (let variant = 1; variant <= 3; variant++) {
    const svg = makeSvg({ slug, name, category, country, variant });
    const fileName = `${variant}.svg`;
    fs.writeFileSync(path.join(outDir, fileName), svg, "utf8");
    photoPaths.push(`/images/restaurants/${slug}/${fileName}`);
  }

  parsed.data.photos = photoPaths;
  const nextContent = matter.stringify("", parsed.data).trimEnd() + "\n";
  fs.writeFileSync(fullPath, nextContent, "utf8");
  updated++;
}

console.log(`Generated placeholder photos and updated ${updated} restaurant files.`);
