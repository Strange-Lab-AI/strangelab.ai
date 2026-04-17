import { copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const rootDir = path.resolve(currentDir, "..");
const contentDir = path.join(rootDir, "content");
const stylesPath = path.join(rootDir, "public", "styles.css");
const distDir = path.join(rootDir, "dist");
const distStylesPath = path.join(distDir, "styles.css");

marked.setOptions({
  gfm: true,
});

async function main() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
  await copyFile(stylesPath, distStylesPath);

  const entries = await getMarkdownEntries(contentDir);

  for (const entry of entries) {
    await buildPage(entry);
  }
}

async function buildPage(entry) {
  const markdown = await readFile(entry.sourcePath, "utf8");
  const title = getTitle(markdown);
  const description = getDescription(markdown);
  const body = marked.parse(markdown);
  const html = renderDocument({
    title,
    description,
    body,
  });
  const htmlPath = path.join(distDir, entry.outputDir, "index.html");

  await mkdir(path.dirname(htmlPath), { recursive: true });
  await writeFile(htmlPath, html, "utf8");
}

async function getMarkdownEntries(directory, relativeDir = "") {
  const items = await readdir(directory, { withFileTypes: true });
  const entries = [];

  for (const item of items) {
    const sourcePath = path.join(directory, item.name);
    const relativePath = path.join(relativeDir, item.name);

    if (item.isDirectory()) {
      const nestedEntries = await getMarkdownEntries(sourcePath, relativePath);

      entries.push(...nestedEntries);
      continue;
    }

    if (!item.name.endsWith(".md")) {
      continue;
    }

    entries.push({
      sourcePath,
      outputDir: getOutputDir(relativePath),
    });
  }

  return entries;
}

function getOutputDir(relativePath) {
  if (relativePath === "site.md") {
    return "";
  }

  return relativePath.replace(/\.md$/, "");
}

function getTitle(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);

  if (!match) {
    return "strangelab.ai";
  }

  return stripInlineMarkdown(match[1]).trim();
}

function getDescription(markdown) {
  const lines = markdown
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  let fallbackHeading = "";

  for (const line of lines) {
    if (line.startsWith("#")) {
      if (!line.startsWith("# ") && !fallbackHeading) {
        fallbackHeading = stripInlineMarkdown(line.replace(/^#+\s+/, ""));
      }

      continue;
    }

    if (line.startsWith("-") || line.startsWith("*")) {
      continue;
    }

    if (/^\[[^\]]+\]\([^)]+\)$/.test(line)) {
      continue;
    }

    return stripInlineMarkdown(line);
  }

  if (fallbackHeading) {
    return fallbackHeading;
  }

  return "Placeholder site";
}

function stripInlineMarkdown(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "");
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderDocument({ title, description, body }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}">
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body>
    <div class="page">
      <main class="content">
        <article class="markdown-body">
${body}
        </article>
      </main>
    </div>
  </body>
</html>
`;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
