// import { readFile, writeFile } from "node:fs/promises";
// import HTMLtoDOCX from "html-to-docx";

// const html = await readFile("./will.html", "utf8");

// const buffer = await HTMLtoDOCX(
//   html,
//   /* headerHTML */ null,
//   {
//     title: "Last Will and Testament",
//     font: "Times New Roman",
//     fontSize: 24,                 // 12pt = 24 half-points
//     pageSize: { width: "8.5in", height: "11in" },
//     margins: { top: "1in", bottom: "1in", left: "2cm", right: "2cm" },
//     footer: true,                 // optional page numbers
//     pageNumber: true
//   },
//   /* footerHTML */ null
// );

// await writeFile("./will.docx", buffer);


const fs = require("fs/promises");
const path = require("path");

async function convertHtmlToDoc(htmlPath) {
  if (!htmlPath) throw new Error("htmlPath is required");
  const abs = path.resolve(htmlPath);
  const out = path.join(path.dirname(abs), path.parse(abs).name + ".doc");

  // Read your HTML as-is
  const html = await fs.readFile(abs, "utf8");

  // Minimal MHTML wrapper (no images/related parts)
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

  // Use CRLF line endings and a UTF-8 BOM for maximum Word compatibility
  mhtml = mhtml.replace(/\r?\n/g, "\r\n");
  const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
  await fs.writeFile(out, Buffer.concat([bom, Buffer.from(mhtml, "utf8")]));

  return out;
}

module.exports = convertHtmlToDoc;