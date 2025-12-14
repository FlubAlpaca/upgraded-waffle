const fs = require("fs/promises");
const Handlebars = require("handlebars");
const path = require("path");

const toMap = (arr = []) =>
  Object.fromEntries(arr.map(({ field, value }) => [field, value]));

function collateForHandlebars(session) {
  const vars  = { ...toMap(session.requiredVariables), ...toMap(session.variables) };
  const flags = { ...toMap(session.requiredFlags),   ...toMap(session.flags) };
  return { ...vars, ...flags };
}

async function renderTemplate(templatePath, data, outHtmlPath) {
  const tplSrc = await fs.readFile(templatePath, "utf8");
  const html = Handlebars.compile(tplSrc)(data);
  await fs.writeFile(outHtmlPath, html, "utf8");
}

async function convertHtmlToDoc(htmlPath) {
  if (!htmlPath) throw new Error("htmlPath is required");
  const abs = path.resolve(htmlPath);
  const out = path.join(path.dirname(abs), path.parse(abs).name + ".doc");

  let html = await fs.readFile(abs, "utf8");

  // Inject base styles and override .doc white-space (prevents mid-paragraph breaks from pre-line)
  if (/<\/head>/i.test(html)) {
    html = html.replace(
      /<\/head>/i,
      `<style>
         body{font-family:"Times New Roman",serif;line-height:1.5}
         .doc{white-space:normal !important}
       </style></head>`
    );
  } else {
    html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <style>
        body{font-family:"Times New Roman",serif;line-height:1.5}
        .doc{white-space:normal !important}
      </style></head>${html.includes("<body")?"":"<body>"}${html}${html.includes("<body")?"":"</body>"}</html>`;
  }

  // Rebuild the .doc block: blank line => <p>, single newline => SPACE (not <br/>)
  const re = /(<div[^>]*class=["'][^"']*\bdoc\b[^"']*["'][^>]*>)([\s\S]*?)(<\/div>)/i;
  const m = html.match(re);
  if (m) {
    let inner = m[2];
    inner = inner.replace(/\r\n?/g, "\n").trim();

    // Split on blank lines (2+ newlines) to get paragraphs
    const parts = inner.split(/\n{2,}/);

    const rebuilt = parts
      .map(block => {
        // keep any explicit <br> the template/values already contain,
        // but collapse incidental single newlines to spaces
        const normalized = block
          .replace(/[ \t]+/g, " ")         // normalize runs of spaces/tabs
          .replace(/[ \t]*\n[ \t]*/g, " "); // <-- the key change: single \n => space
        return `<p style="margin:0 0 12pt 0;">${normalized.trim()}</p>`;
      })
      .join("\n");

    html = html.replace(re, (match, g1, g2, g3) => `${g1}\n${rebuilt}\n${g3}`);
  }

  // MHTML wrapper for .doc
  const boundary = "----=_NextPart_" + Date.now().toString(36);
  let mhtml =
`Mime-Version: 1.0
Content-Type: multipart/related; boundary="${boundary}"; type="text/html"

--${boundary}
Content-Type: text/html; charset="utf-8"
Content-Location: file:///document.html

${html}

--${boundary}--
`;
  mhtml = mhtml.replace(/\r?\n/g, "\r\n");
  const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
  await fs.writeFile(out, Buffer.concat([bom, Buffer.from(mhtml, "utf8")]));
  return out;
}

module.exports = { collateForHandlebars, renderTemplate, convertHtmlToDoc };   