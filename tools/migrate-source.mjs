import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceRoot = path.join(root, "_source_import", "split");
const srcRoot = path.join(root, "src");
const publicRoot = path.join(root, "public");

const read = (file) => fs.readFileSync(file, "utf8");
const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
};

const manifest = JSON.parse(read(path.join(sourceRoot, "manifest.json")));
const head = read(path.join(sourceRoot, "shared", "_head.html"));
const footer = read(path.join(sourceRoot, "shared", "_footer.html"));

const pageRecords = manifest.map((entry) => {
  const slug = entry.file
    .replace(/\.html$/, "")
    .replace(/^\d+b?-/, "")
    .replace(/^00-/, "");
  return {
    id: entry.id,
    slug,
    file: entry.file,
    html: read(path.join(sourceRoot, "pages", entry.file))
  };
});

const idToSlug = new Map(pageRecords.map((page) => [page.id, page.slug]));
const cssMatch = head.match(/<style>([\s\S]*?)<\/style>/);
if (!cssMatch) throw new Error("Could not find CSS in shared/_head.html");

const css = `${cssMatch[1].trim()}

/* Astro route mode: each route renders one page instead of hiding inactive page fragments. */
.tab-panel .page-view{display:block;}
.tab-panel .page-view:not(.active){display:block;}
.doc-tab{text-decoration:none;}
`;

const tabBarMatch = head.match(/<div class="tab-bar" id="tabBar">([\s\S]*?)\n  <\/div>\n\n  <div class="tab-panel">/);
if (!tabBarMatch) throw new Error("Could not find tab bar in shared/_head.html");

const groups = [];
const groupRegex = /<div class="tab-group">\s*<div class="tab-group-label">([\s\S]*?)<\/div>\s*<div class="tab-group-tabs">([\s\S]*?)<\/div>\s*<\/div>/g;
let groupMatch;
while ((groupMatch = groupRegex.exec(tabBarMatch[1]))) {
  const label = groupMatch[1].trim();
  const tabs = [];
  const tabRegex = /<button type="button" class="doc-tab(?: active)?" data-target="([^"]+)">([\s\S]*?)<\/button>/g;
  let tabMatch;
  while ((tabMatch = tabRegex.exec(groupMatch[2]))) {
    const id = tabMatch[1];
    const slug = idToSlug.get(id);
    if (!slug) continue;
    const glyph = tabMatch[2].match(/<span class="tab-glyph">([\s\S]*?)<\/span>/)?.[1].trim() ?? "";
    const text = tabMatch[2].match(/<span class="tab-text">([\s\S]*?)<small>/)?.[1].trim() ?? slug;
    const small = tabMatch[2].match(/<small>([\s\S]*?)<\/small>/)?.[1].trim() ?? "";
    tabs.push({ id, slug, glyph, text, small });
  }
  groups.push({ label, tabs });
}

const footerBody = footer
  .replace(/^\s*<\/div><!-- \/tab-panel -->\s*<\/div><!-- \/wrap -->\s*/u, "")
  .replace(/\s*<\/body>\s*<\/html>\s*$/u, "")
  .replace(
    /document\.querySelectorAll\("#tabBar \.doc-tab"\)\.forEach\(btn => \{\s*btn\.addEventListener\("click", \(\) => \{/u,
    'document.querySelectorAll("#tabBar .doc-tab").forEach(btn => {\n  btn.addEventListener("click", () => {\n    if (!btn.dataset.target) return;'
  )
  .replace(
    /document\.getElementById\(btn\.dataset\.target\)\.classList\.add\("active"\);/u,
    'const panel = document.getElementById(btn.dataset.target);\n    if (panel) panel.classList.add("active");'
  )
  .trim();

write(path.join(srcRoot, "styles", "global.css"), css);
write(path.join(srcRoot, "data", "ja-pages.json"), JSON.stringify(pageRecords.map(({ id, slug, file }) => ({ id, slug, file })), null, 2));
write(path.join(srcRoot, "data", "ja-nav.json"), JSON.stringify(groups, null, 2));
write(path.join(srcRoot, "partials", "legacy-footer.html"), `${footerBody}\n`);

for (const page of pageRecords) {
  const activeHtml = page.html.replace(/class="page-view\b/, 'class="page-view active');
  write(path.join(srcRoot, "content", "ja", `${page.slug}.html`), `${activeHtml.trim()}\n`);
}

const layout = `---
import "../styles/global.css";
import navGroups from "../data/ja-nav.json";

const { title = "外's Net", activeId = "" } = Astro.props;
const canonicalBase = new URL(Astro.url.pathname, Astro.site ?? Astro.url.origin);
---
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content="日本で暮らす外国人のための生活・不動産・交通・税金ツール集" />
    <link rel="canonical" href={canonicalBase.href} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;600;700&family=Noto+Sans+JP:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div class="wrap">
      <div class="masthead">
        <h1>外's Net <span class="site-tagline" id="siteTagline" style="font-size:13px;color:var(--ink-soft);font-weight:400;">日本で暮らす外国人をつなぐ</span></h1>
        <div class="masthead-right">
          <a class:list={["about-nav-btn", activeId === "page-about" && "active"]} id="aboutNavBtn" href="/ja/about/" data-no-i18n><span id="aboutNavLabel">サイトについて</span></a>
          <div class="site-language-control" hidden>
            <label for="siteLanguage">言語</label>
            <select id="siteLanguage" aria-label="表示言語" data-no-i18n>
              <option value="ja" selected>日本語</option>
            </select>
          </div>
        </div>
      </div>

      <nav class="tab-bar" id="tabBar" aria-label="ページ一覧">
        {navGroups.map((group) => (
          <div class="tab-group">
            <div class="tab-group-label">{group.label}</div>
            <div class="tab-group-tabs">
              {group.tabs.map((tab) => (
                <a class:list={["doc-tab", activeId === tab.id && "active"]} href={\`/ja/\${tab.slug}/\`}>
                  <span class="tab-glyph">{tab.glyph}</span>
                  <span class="tab-text">{tab.text}<small>{tab.small}</small></span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <main class="tab-panel">
        <slot />
      </main>
    </div>

    <Fragment set:html={await Astro.slots.render("legacyFooter")} />
  </body>
</html>
`;

write(path.join(srcRoot, "layouts", "BaseLayout.astro"), layout);

const pageTemplate = `---
import fs from "node:fs/promises";
import path from "node:path";
import BaseLayout from "../../layouts/BaseLayout.astro";
import pages from "../../data/ja-pages.json";

export async function getStaticPaths() {
  return pages.map((page) => ({
    params: { slug: page.slug },
    props: { page }
  }));
}

const { page } = Astro.props;
const content = await fs.readFile(path.join(process.cwd(), "src", "content", "ja", \`\${page.slug}.html\`), "utf8");
---
<BaseLayout title={\`外's Net | \${page.slug}\`} activeId={page.id}>
  <Fragment set:html={content} />
  <Fragment slot="legacyFooter" set:html={await fs.readFile(path.join(process.cwd(), "src", "partials", "legacy-footer.html"), "utf8")} />
</BaseLayout>
`;
write(path.join(srcRoot, "pages", "ja", "[slug].astro"), pageTemplate);

const indexPage = `---
return Astro.redirect("/ja/rent/");
---
`;
write(path.join(srcRoot, "pages", "index.astro"), indexPage);

const jaIndex = `---
return Astro.redirect("/ja/rent/");
---
`;
write(path.join(srcRoot, "pages", "ja", "index.astro"), jaIndex);

console.log(`Migrated ${pageRecords.length} Japanese pages to Astro.`);
