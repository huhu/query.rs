// Regenerate lib/index/error-codes.js from the published Rust error-code book.
// Usage: node scripts/generate-error-codes.js
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const LISTING_URL = "https://doc.rust-lang.org/error_codes/";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function summarize(code, body) {
    let text = String(body || "").replace(/\s+/g, " ").trim();
    const lead = `Error code ${code}`;
    if (text.startsWith(lead)) {
        text = text.slice(lead.length).trim();
    }

    let cutAt = text.length;
    for (const marker of [/Erroneous code example/i, /Example of erroneous code/i]) {
        const index = text.search(marker);
        if (index > 20 && index < cutAt) {
            cutAt = index;
        }
    }
    text = text.slice(0, cutAt).trim().replace(/\.{2,}/g, "…");

    const sentences = text.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter(Boolean);
    const isNote = (sentence) => /^Note: this error code is no longer emitted by the compiler\.?$/i.test(sentence);
    // Skip sentences that are mostly pasted sample code. Attribute names are fine.
    const isProse = (sentence) => sentence.length >= 20 && !/[{}]|\bfn main\b|\bstruct\s|\blet\s/.test(sentence);
    const note = sentences.find(isNote);
    const explanation = sentences.find((sentence) => isProse(sentence) && !isNote(sentence));
    let summary = explanation || note || sentences[0] || "";
    if (note && explanation) {
        summary = `${note.replace(/\.$/, "")}. ${explanation}`;
    }
    summary = summary.replace(/\s+/g, " ").trim().replace(/[:\s]+$/, "");
    if (summary && !/[.!?…]$/.test(summary)) {
        summary += ".";
    }

    const max = 160;
    if (summary.length > max) {
        const clipped = summary.slice(0, max - 1);
        const lastSpace = clipped.lastIndexOf(" ");
        summary = `${(lastSpace > 80 ? clipped.slice(0, lastSpace) : clipped).trimEnd().replace(/[,:;]+$/, "")}…`;
    }
    return summary;
}

const html = await (await fetch(LISTING_URL)).text();
const listed = [...new Set([...html.matchAll(/href="\.\/(E\d{4})\.html"/g)].map((match) => match[1]))].sort();
if (listed.length < 400) {
    throw new Error(`Expected the error-code listing to contain hundreds of pages, found ${listed.length}`);
}

const searchFile = html.match(/searchindex-[a-z0-9]+\.js/)?.[0];
if (!searchFile) {
    throw new Error("Could not find the error-code book search index");
}
const searchJs = await (await fetch(new URL(searchFile, LISTING_URL))).text();
const sandbox = { window: { search: {} } };
vm.runInNewContext(searchJs, sandbox);

const descriptions = new Map();
const { doc_urls: docUrls, index } = sandbox.window.search;
const docs = index.documentStore.docs;
docUrls.forEach((url, position) => {
    const code = url.match(/^(E\d{4})\.html$/)?.[1];
    if (code) {
        descriptions.set(code, docs[String(position)]?.body || "");
    }
});

const errorCodesIndex = {};
for (const code of listed) {
    errorCodesIndex[code] = summarize(code, descriptions.get(code));
}

for (const required of ["E0038", "E0382"]) {
    if (!errorCodesIndex[required]) {
        throw new Error(`Published error code ${required} is missing from the generated index`);
    }
}
for (const removed of ["E0039", "E0385"]) {
    if (errorCodesIndex[removed]) {
        throw new Error(`Removed error code ${removed} was included in the generated index`);
    }
}

const output = `// Generated from ${LISTING_URL}\n// Regenerate with: node scripts/generate-error-codes.js\nconst errorCodesIndex = ${JSON.stringify(errorCodesIndex)};\nexport default errorCodesIndex;\n`;
const destination = resolve(root, "lib/index/error-codes.js");
writeFileSync(destination, output);
console.log(`Wrote ${listed.length} error codes to ${destination}`);
