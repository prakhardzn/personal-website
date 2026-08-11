import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvFile } from "node:process";
import { movieImportList } from "./movie-import-list.mjs";

const ROOT = process.cwd();
const TARGET_DIR = path.join(ROOT, "src", "content", "movies");

const args = new Set(process.argv.slice(2));
const groupArg = process.argv.slice(2).find((arg) => arg.startsWith("--group="));
const delayArg = process.argv.slice(2).find((arg) => arg.startsWith("--delay="));

const SELECTED_GROUP = groupArg ? groupArg.slice("--group=".length).trim() : "";
const DRY_RUN = args.has("--dry-run");
const OVERWRITE = args.has("--overwrite");
const DELAY_MS = Math.max(
  0,
  Number.parseInt(delayArg?.slice("--delay=".length) || "350", 10) || 350
);

if (args.has("--help")) {
  console.log(`
PORTAL 214 // MOVIE BULK IMPORTER

Run all groups:
  node scripts/import-movies.mjs

Run one group:
  node scripts/import-movies.mjs --group=marvel
  node scripts/import-movies.mjs --group=pixar
  node scripts/import-movies.mjs --group=disney-animation

Preview without writing files:
  node scripts/import-movies.mjs --dry-run

Overwrite files previously created with the same title/year:
  node scripts/import-movies.mjs --overwrite

Slow requests down:
  node scripts/import-movies.mjs --delay=700
`);
  process.exit(0);
}

try {
  loadEnvFile(path.join(ROOT, ".env"));
} catch {
  // A missing .env is handled by the explicit API-key check below.
}

const OMDB_API_KEY = process.env.OMDB_API_KEY?.trim();

if (!OMDB_API_KEY) {
  console.error(
    "\n[PORTAL 214] OMDB_API_KEY is missing.\n" +
      "Keep the same OMDB_API_KEY you already use for the Libraries search inside your project .env file.\n"
  );
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalise = (value = "") =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const slugify = (value) =>
  normalise(value)
    .replace(/&/g, " and ")
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);

const yamlString = (value) => JSON.stringify(String(value ?? ""));

const cleanOmdbValue = (value) => {
  const stringValue = String(value ?? "").trim();
  return stringValue && stringValue !== "N/A" ? stringValue : "";
};

const parseExistingFrontmatter = (text) => {
  const block = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!block) return null;

  const read = (key) => {
    const match = block[1].match(
      new RegExp(`^${key}:\\s*(?:"([^"]*)"|'([^']*)'|([^\\r\\n#]+))`, "mi")
    );
    return (match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim();
  };

  return {
    title: read("title"),
    year: read("year"),
  };
};

const existingRecords = new Map();

const loadExistingRecords = async () => {
  await mkdir(TARGET_DIR, { recursive: true });

  const files = await readdir(TARGET_DIR, { withFileTypes: true });

  for (const item of files) {
    if (!item.isFile() || !/\.(md|mdx)$/i.test(item.name)) continue;

    const filePath = path.join(TARGET_DIR, item.name);
    const text = await readFile(filePath, "utf8");
    const record = parseExistingFrontmatter(text);

    if (!record?.title) continue;

    const titleKey = normalise(record.title);
    const exactKey = `${titleKey}|${record.year || ""}`;

    existingRecords.set(exactKey, item.name);

    if (!record.year) {
      existingRecords.set(`${titleKey}|*`, item.name);
    }
  }
};

const dedupeManifest = (items) => {
  const seen = new Set();
  const output = [];

  for (const item of items) {
    const key = `${normalise(item.title)}|${item.year}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }

  return output;
};

const requestOmdb = async (params, attempt = 1) => {
  const url = new URL("https://www.omdbapi.com/");
  url.searchParams.set("apikey", OMDB_API_KEY);
  url.searchParams.set("r", "json");

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Portal-214-Movie-Importer/1.1",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (attempt < 3) {
      await sleep(800 * attempt);
      return requestOmdb(params, attempt + 1);
    }
    throw error;
  }
};

const findMovie = async ({ title, year }) => {
  let data = await requestOmdb({
    t: title,
    y: year,
    type: "movie",
    plot: "short",
  });

  if (data?.Response !== "False") return data;

  const search = await requestOmdb({
    s: title,
    y: year,
    type: "movie",
  });

  if (search?.Response !== "False" && Array.isArray(search.Search)) {
    const exactYear = search.Search.find(
      (item) =>
        item.Type === "movie" &&
        String(item.Year ?? "").startsWith(String(year))
    );

    const firstMovie =
      exactYear ??
      search.Search.find((item) => item.Type === "movie");

    if (firstMovie?.imdbID) {
      data = await requestOmdb({
        i: firstMovie.imdbID,
        plot: "short",
      });

      if (data?.Response !== "False") return data;
    }
  }

  data = await requestOmdb({
    t: title,
    type: "movie",
    plot: "short",
  });

  return data?.Response !== "False" ? data : null;
};

const buildMarkdown = (movie) => {
  const title = cleanOmdbValue(movie.Title);
  const year = cleanOmdbValue(movie.Year);
  const imdbId = cleanOmdbValue(movie.imdbID);
  const director = cleanOmdbValue(movie.Director);
  const poster = cleanOmdbValue(movie.Poster);
  const rating = cleanOmdbValue(movie.imdbRating);

  if (!imdbId) {
    throw new Error(`OMDb record for "${title || "unknown movie"}" has no imdbID.`);
  }

  const lines = [
    "---",
    `title: ${yamlString(title)}`,
    `year: ${yamlString(year)}`,
    `imdbId: ${yamlString(imdbId)}`,
  ];

  if (director) lines.push(`director: ${yamlString(director)}`);
  if (poster) lines.push(`poster: ${yamlString(poster)}`);
  if (rating) lines.push(`rating: ${yamlString(rating)}`);

  lines.push("draft: false", "---", "");

  return lines.join("\n");
};

const selected = movieImportList.filter(
  (item) => !SELECTED_GROUP || item.group === SELECTED_GROUP
);

const uniqueSelected = dedupeManifest(selected);

if (SELECTED_GROUP && selected.length === 0) {
  const available = [...new Set(movieImportList.map((item) => item.group))].sort();
  console.error(
    `\n[PORTAL 214] Unknown group "${SELECTED_GROUP}".\n\nAvailable groups:\n` +
      available.map((group) => `  - ${group}`).join("\n")
  );
  process.exit(1);
}

await loadExistingRecords();

console.log("\nPORTAL 214 // MOVIE BULK IMPORT");
console.log("--------------------------------");
console.log(`Mode:         ${DRY_RUN ? "DRY RUN" : "WRITE"}`);
console.log(`Group:        ${SELECTED_GROUP || "ALL"}`);
console.log(`Manifest:     ${selected.length}`);
console.log(`After dedupe: ${uniqueSelected.length}`);
console.log(`Target:       ${path.relative(ROOT, TARGET_DIR)}`);
console.log("");

let created = 0;
let skipped = 0;
let failed = 0;
const failures = [];
const importedImdbIds = new Set();

for (let index = 0; index < uniqueSelected.length; index += 1) {
  const requested = uniqueSelected[index];
  const requestedKey = `${normalise(requested.title)}|${requested.year}`;
  const wildcardKey = `${normalise(requested.title)}|*`;

  const existing =
    existingRecords.get(requestedKey) ??
    existingRecords.get(wildcardKey);

  if (existing && !OVERWRITE) {
    skipped += 1;
    console.log(
      `[${String(index + 1).padStart(3, "0")}/${String(uniqueSelected.length).padStart(3, "0")}] SKIP  ${requested.title} (${requested.year}) -> ${existing}`
    );
    continue;
  }

  try {
    const movie = await findMovie(requested);

    if (!movie) {
      throw new Error("No OMDb match");
    }

    const imdbID = cleanOmdbValue(movie.imdbID);

    if (!imdbID) {
      throw new Error("OMDb result has no imdbID");
    }

    if (importedImdbIds.has(imdbID)) {
      skipped += 1;
      console.log(
        `[${String(index + 1).padStart(3, "0")}/${String(uniqueSelected.length).padStart(3, "0")}] DUPE  ${requested.title} (${requested.year})`
      );
      continue;
    }

    const resolvedTitle = cleanOmdbValue(movie.Title) || requested.title;
    const resolvedYear = cleanOmdbValue(movie.Year) || String(requested.year);

    const fileName = `${slugify(resolvedTitle)}-${resolvedYear.replace(/[^0-9]/g, "").slice(0, 4) || requested.year}.md`;
    const filePath = path.join(TARGET_DIR, fileName);

    let fileAlreadyExists = false;

    try {
      await access(filePath);
      fileAlreadyExists = true;
    } catch {
      fileAlreadyExists = false;
    }

    if (fileAlreadyExists && !OVERWRITE) {
      skipped += 1;
      console.log(
        `[${String(index + 1).padStart(3, "0")}/${String(uniqueSelected.length).padStart(3, "0")}] SKIP  ${resolvedTitle} (${resolvedYear}) -> ${fileName}`
      );
      importedImdbIds.add(imdbID);
      continue;
    }

    if (!DRY_RUN) {
      await writeFile(filePath, buildMarkdown(movie), "utf8");
    }

    created += 1;
    importedImdbIds.add(imdbID);

    console.log(
      `[${String(index + 1).padStart(3, "0")}/${String(uniqueSelected.length).padStart(3, "0")}] ${DRY_RUN ? "WOULD" : "ADD "}  ${resolvedTitle} (${resolvedYear})`
    );
  } catch (error) {
    failed += 1;
    const reason = error instanceof Error ? error.message : String(error);
    failures.push({ ...requested, reason });

    console.error(
      `[${String(index + 1).padStart(3, "0")}/${String(uniqueSelected.length).padStart(3, "0")}] FAIL  ${requested.title} (${requested.year}) // ${reason}`
    );
  }

  if (index < uniqueSelected.length - 1) {
    await sleep(DELAY_MS);
  }
}

console.log("\n--------------------------------");
console.log("IMPORT COMPLETE");
console.log(`Added:   ${created}`);
console.log(`Skipped: ${skipped}`);
console.log(`Failed:  ${failed}`);

if (failures.length) {
  console.log("\nFAILED RECORDS");
  for (const item of failures) {
    console.log(`- [${item.group}] ${item.title} (${item.year}) // ${item.reason}`);
  }
}

console.log(
  DRY_RUN
    ? "\nDry run finished. No Markdown files were written.\n"
    : "\nSaved records are in src/content/movies.\n"
);
