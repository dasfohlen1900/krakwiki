const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const wikiFolder = path.join(__dirname, "wiki");
const outputFile = path.join(wikiFolder, "index.json");

function getHtmlFiles(dir) {
  const files = fs.readdirSync(dir);
  let htmlFiles = [];
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) htmlFiles = htmlFiles.concat(getHtmlFiles(fullPath));
    else if (file.endsWith(".html") && file !== "index.json") htmlFiles.push(fullPath);
  }
  return htmlFiles;
}

function getSnippet(filePath) {
  const html = fs.readFileSync(filePath, "utf-8");
  const $ = cheerio.load(html);
  const p = $("main p").first() || $("p").first();
  if (!p) return "";
  let text = p.text().trim();
  if (text.length > 200) text = text.slice(0, 200) + "...";
  return text;
}

function generateIndex() {
  const files = getHtmlFiles(wikiFolder);
  const index = files.map(file => {
    const relative = path.relative(wikiFolder, file).replace(/\\/g, "/");
    const title = path.basename(file, ".html");
    const snippet = getSnippet(file);
    return { title, file: `wiki/${relative}`, snippet };
  });

  fs.writeFileSync(outputFile, JSON.stringify(index, null, 2));
  console.log("✅ index.json erstellt mit", index.length, "Artikeln");
}

generateIndex();
