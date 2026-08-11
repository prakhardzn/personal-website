import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const moviesDirectory = path.join(projectRoot, "src", "content", "movies");
const envPath = path.join(projectRoot, ".env");

async function loadEnvironmentVariable(variableName) {
  let envText = "";

  try {
    envText = await fs.readFile(envPath, "utf8");
  } catch {
    return null;
  }

  for (const originalLine of envText.split(/\r?\n/)) {
    const line = originalLine.trim();

    if (!line || line.startsWith("#")) continue;

    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = line.slice(0, equalsIndex).trim();
    if (key !== variableName) continue;

    let value = line.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    return value;
  }

  return null;
}

function getFrontmatter(text) {
  const match = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : null;
}

function getBody(text) {
  const match = text.match(/^---\s*\r?\n[\s\S]*?\r?\n---\s*(?:\r?\n)?([\s\S]*)$/);
  return match ? match[1] : "";
}

function readScalar(frontmatter, key) {
  const match = frontmatter.match(
    new RegExp(`^${key}:\\s*(?:"([^"]*)"|'([^']*)'|([^\\r\\n#]+))`, "mi")
  );

  return (match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim();
}

function hasKey(frontmatter, key) {
  return new RegExp(`^${key}:\\s*`, "mi").test(frontmatter);
}

function insertAfterKey(text, afterKey, newLine) {
  const pattern = new RegExp(`^${afterKey}:\\s*[^\\r\\n]*$`, "mi");

  if (pattern.test(text)) {
    return text.replace(pattern, (line) => `${line}\n${newLine}`);
  }

  return text.replace(/^---\s*\r?\n/, `---\n${newLine}\n`);
}

function normaliseYear(value) {
  const match = String(value ?? "").match(/\d{4}/);
  return match ? match[0] : "";
}

function slugify(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function requestOmdb(apiKey, title, year, attempt = 1) {
  const exactUrl = new URL("https://www.omdbapi.com/");
  exactUrl.searchParams.set("apikey", apiKey);
  exactUrl.searchParams.set("t", title);
  exactUrl.searchParams.set("type", "movie");
  exactUrl.searchParams.set("r", "json");

  if (year) exactUrl.searchParams.set("y", year);

  try {
    let response = await fetch(exactUrl);
    let data = await response.json();

    if (response.ok && data?.Response !== "False" && data?.imdbID) {
      return data.imdbID;
    }

    const searchUrl = new URL("https://www.omdbapi.com/");
    searchUrl.searchParams.set("apikey", apiKey);
    searchUrl.searchParams.set("s", title);
    searchUrl.searchParams.set("type", "movie");
    searchUrl.searchParams.set("r", "json");

    if (year) searchUrl.searchParams.set("y", year);

    response = await fetch(searchUrl);
    data = await response.json();

    if (response.ok && data?.Response !== "False" && Array.isArray(data?.Search)) {
      const exactYear =
        data.Search.find(
          (item) =>
            item?.Type === "movie" &&
            normaliseYear(item?.Year) === year
        ) ??
        data.Search.find((item) => item?.Type === "movie");

      if (exactYear?.imdbID) {
        return exactYear.imdbID;
      }
    }
  } catch (error) {
    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
      return requestOmdb(apiKey, title, year, attempt + 1);
    }
  }

  return null;
}

const apiKey = await loadEnvironmentVariable("OMDB_API_KEY");

const entries = (await fs.readdir(moviesDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && /\.(md|mdx)$/i.test(entry.name))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

let addedAddedAt = 0;
let addedImdbId = 0;
let unresolvedImdbId = 0;
let alreadyValid = 0;
let failed = 0;

console.log("");
console.log("PORTAL 214 // FINAL MOVIE SCHEMA REPAIR");
console.log("----------------------------------------");
console.log(`Scanning ${entries.length} Markdown files.`);
console.log("");

for (let index = 0; index < entries.length; index += 1) {
  const fileName = entries[index];
  const filePath = path.join(moviesDirectory, fileName);

  try {
    let text = await fs.readFile(filePath, "utf8");
    let frontmatter = getFrontmatter(text);

    if (!frontmatter) {
      failed += 1;
      console.error(`FAIL  ${fileName} // no YAML frontmatter`);
      continue;
    }

    const title = readScalar(frontmatter, "title");
    const year = normaliseYear(readScalar(frontmatter, "year"));

    if (!title) {
      failed += 1;
      console.error(`FAIL  ${fileName} // missing title`);
      continue;
    }

    let changed = false;

    // ---------------------------------------------------------
    // REQUIRED FIELD: imdbId
    // ---------------------------------------------------------
    if (!hasKey(frontmatter, "imdbId")) {
      let imdbId = null;

      if (apiKey) {
        imdbId = await requestOmdb(apiKey, title, year);
      }

      if (!imdbId) {
        // The schema requires a string. Keep the record build-safe while
        // making unresolved IDs explicit rather than inventing a fake IMDb ID.
        imdbId = `UNRESOLVED-${slugify(title)}-${year || "unknown"}`;
        unresolvedImdbId += 1;
      } else {
        addedImdbId += 1;
      }

      text = insertAfterKey(
        text,
        "year",
        `imdbId: ${JSON.stringify(imdbId)}`
      );

      changed = true;
      frontmatter = getFrontmatter(text);
    }

    // ---------------------------------------------------------
    // REQUIRED FIELD: addedAt
    // ---------------------------------------------------------
    if (!hasKey(frontmatter, "addedAt")) {
      const stats = await fs.stat(filePath);

      const timestamp =
        stats.birthtime instanceof Date && !Number.isNaN(stats.birthtime.valueOf())
          ? stats.birthtime.toISOString()
          : stats.mtime.toISOString();

      // Place addedAt immediately before the closing frontmatter delimiter.
      text = text.replace(
        /\r?\n---(\s*(?:\r?\n|$))/,
        `\naddedAt: ${JSON.stringify(timestamp)}\n---$1`
      );

      addedAddedAt += 1;
      changed = true;
    }

    if (changed) {
      await fs.writeFile(filePath, text, "utf8");
      console.log(
        `FIX   ${fileName}` +
          (!apiKey ? " // OMDb key unavailable; unresolved IDs may be present" : "")
      );
    } else {
      alreadyValid += 1;
      console.log(`OK    ${fileName}`);
    }

    // Avoid hammering OMDb only when we actually had to resolve an ID.
    if (changed && apiKey) {
      await new Promise((resolve) => setTimeout(resolve, 220));
    }
  } catch (error) {
    failed += 1;
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`FAIL  ${fileName} // ${reason}`);
  }
}

console.log("");
console.log("----------------------------------------");
console.log("REPAIR COMPLETE");
console.log(`addedAt inserted:       ${addedAddedAt}`);
console.log(`IMDb IDs resolved:      ${addedImdbId}`);
console.log(`IMDb IDs unresolved:    ${unresolvedImdbId}`);
console.log(`Already schema-ready:   ${alreadyValid}`);
console.log(`Failed files:           ${failed}`);
console.log("");

if (unresolvedImdbId > 0) {
  console.log(
    "UNRESOLVED-* values are deliberate placeholders so Astro can validate the required string field."
  );
  console.log(
    "They can be replaced with real IMDb IDs later without blocking the site."
  );
  console.log("");
}

console.log("NOW RUN:");
console.log("  pnpm astro sync");
console.log("");
console.log("If sync passes:");
console.log("  pnpm dev");
console.log("");
