import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot =
  process.cwd();

const envPath =
  path.join(
    projectRoot,
    ".env"
  );

const moviesDirectory =
  path.join(
    projectRoot,
    "src",
    "content",
    "movies"
  );

const posterDirectory =
  path.join(
    projectRoot,
    "public",
    "assets",
    "library",
    "movies"
  );


/* =========================================================
   ENVIRONMENT
   ========================================================= */

async function loadEnvironmentVariable(
  variableName
) {
  let envText;

  try {
    envText =
      await fs.readFile(
        envPath,
        "utf8"
      );
  } catch {
    throw new Error(
      "Could not find .env in the project root."
    );
  }

  const lines =
    envText.split(
      /\r?\n/
    );

  for (
    const originalLine
    of lines
  ) {
    const line =
      originalLine.trim();

    if (
      !line ||
      line.startsWith("#")
    ) {
      continue;
    }

    const equalsIndex =
      line.indexOf("=");

    if (
      equalsIndex === -1
    ) {
      continue;
    }

    const key =
      line
        .slice(
          0,
          equalsIndex
        )
        .trim();

    if (
      key !==
      variableName
    ) {
      continue;
    }

    let value =
      line
        .slice(
          equalsIndex + 1
        )
        .trim();

    if (
      (
        value.startsWith('"') &&
        value.endsWith('"')
      ) ||
      (
        value.startsWith("'") &&
        value.endsWith("'")
      )
    ) {
      value =
        value.slice(
          1,
          -1
        );
    }

    return value;
  }

  return null;
}


/* =========================================================
   HELPERS
   ========================================================= */

function slugify(
  value
) {
  return value
    .normalize("NFKD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .replace(
      /&/g,
      " and "
    )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}


function cleanValue(
  value
) {
  if (
    !value ||
    value === "N/A"
  ) {
    return null;
  }

  return String(
    value
  ).trim();
}


function splitList(
  value
) {
  const cleaned =
    cleanValue(
      value
    );

  if (!cleaned) {
    return [];
  }

  return cleaned
    .split(",")
    .map(
      (item) =>
        item.trim()
    )
    .filter(Boolean);
}


function yamlString(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "null";
  }

  return JSON.stringify(
    String(value)
  );
}


function yamlArray(
  values
) {
  return JSON.stringify(
    values
  );
}


/* =========================================================
   POSTER DOWNLOAD
   ========================================================= */

async function downloadPoster(
  posterUrl,
  slug
) {
  if (
    !posterUrl ||
    posterUrl === "N/A"
  ) {
    return null;
  }

  try {
    console.log(
      "Downloading poster..."
    );

    const response =
      await fetch(
        posterUrl,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0",
          },
        }
      );

    if (
      !response.ok
    ) {
      throw new Error(
        `Poster returned HTTP ${response.status}`
      );
    }

    const contentType =
      response.headers
        .get(
          "content-type"
        )
        ?.toLowerCase() ??
      "";

    let extension =
      "jpg";

    if (
      contentType.includes(
        "png"
      )
    ) {
      extension =
        "png";
    }

    if (
      contentType.includes(
        "webp"
      )
    ) {
      extension =
        "webp";
    }

    const filename =
      `${slug}.${extension}`;

    const localPath =
      path.join(
        posterDirectory,
        filename
      );

    const arrayBuffer =
      await response.arrayBuffer();

    await fs.mkdir(
      posterDirectory,
      {
        recursive: true,
      }
    );

    await fs.writeFile(
      localPath,
      Buffer.from(
        arrayBuffer
      )
    );

    console.log(
      `Poster saved: public/assets/library/movies/${filename}`
    );

    return `/assets/library/movies/${filename}`;
  } catch (
    error
  ) {
    console.warn(
      "Could not download poster locally."
    );

    console.warn(
      "Using the remote OMDb poster URL instead."
    );

    return posterUrl;
  }
}


/* =========================================================
   COMMAND INPUT
   ========================================================= */

const args =
  process.argv.slice(
    2
  );

if (
  args.length === 0
) {
  console.error(
    ""
  );

  console.error(
    "Movie title missing."
  );

  console.error(
    ""
  );

  console.error(
    'Example:'
  );

  console.error(
    'node scripts/add-movie.mjs "Interstellar"'
  );

  console.error(
    ""
  );

  console.error(
    'For remakes you can include the year:'
  );

  console.error(
    'node scripts/add-movie.mjs "Dune" 2021'
  );

  process.exit(
    1
  );
}


let requestedYear =
  null;

let titleParts =
  [...args];

const finalArgument =
  titleParts[
    titleParts.length - 1
  ];

if (
  titleParts.length > 1 &&
  /^\d{4}$/.test(
    finalArgument
  )
) {
  requestedYear =
    finalArgument;

  titleParts =
    titleParts.slice(
      0,
      -1
    );
}

const requestedMovie =
  titleParts
    .join(" ")
    .trim();


/* =========================================================
   LOAD API KEY
   ========================================================= */

const apiKey =
  await loadEnvironmentVariable(
    "OMDB_API_KEY"
  );

if (!apiKey) {
  console.error(
    ""
  );

  console.error(
    "OMDB_API_KEY was not found in .env."
  );

  console.error(
    ""
  );

  process.exit(
    1
  );
}


/* =========================================================
   OMDb REQUEST
   ========================================================= */

const omdbUrl =
  new URL(
    "https://www.omdbapi.com/"
  );

omdbUrl.searchParams.set(
  "apikey",
  apiKey
);

if (
  /^tt\d+$/i.test(
    requestedMovie
  )
) {
  omdbUrl.searchParams.set(
    "i",
    requestedMovie
  );
} else {
  omdbUrl.searchParams.set(
    "t",
    requestedMovie
  );

  if (
    requestedYear
  ) {
    omdbUrl.searchParams.set(
      "y",
      requestedYear
    );
  }
}

omdbUrl.searchParams.set(
  "type",
  "movie"
);

omdbUrl.searchParams.set(
  "plot",
  "full"
);

omdbUrl.searchParams.set(
  "r",
  "json"
);

console.log(
  ""
);

console.log(
  `Searching OMDb for: ${requestedMovie}${
    requestedYear
      ? ` (${requestedYear})`
      : ""
  }`
);

let response;

try {
  response =
    await fetch(
      omdbUrl
    );
} catch (
  error
) {
  console.error(
    ""
  );

  console.error(
    "Could not connect to OMDb."
  );

  console.error(
    error
  );

  process.exit(
    1
  );
}


let movie;

try {
  movie =
    await response.json();
} catch {
  console.error(
    "OMDb returned an unreadable response."
  );

  process.exit(
    1
  );
}


if (
  !response.ok ||
  movie.Response ===
    "False"
) {
  console.error(
    ""
  );

  console.error(
    movie.Error ??
      `OMDb returned HTTP ${response.status}.`
  );

  console.error(
    ""
  );

  process.exit(
    1
  );
}


/* =========================================================
   PREPARE MOVIE
   ========================================================= */

const title =
  cleanValue(
    movie.Title
  );

const year =
  cleanValue(
    movie.Year
  );

const imdbId =
  cleanValue(
    movie.imdbID
  );

if (
  !title ||
  !year ||
  !imdbId
) {
  console.error(
    "OMDb returned an incomplete movie record."
  );

  process.exit(
    1
  );
}


const slug =
  `${slugify(
    title
  )}-${slugify(
    year
  )}`;

const markdownPath =
  path.join(
    moviesDirectory,
    `${slug}.md`
  );


/* =========================================================
   DUPLICATE PROTECTION
   ========================================================= */

try {
  await fs.access(
    markdownPath
  );

  console.error(
    ""
  );

  console.error(
    `Movie already exists: ${slug}.md`
  );

  console.error(
    ""
  );

  process.exit(
    1
  );
} catch {
  // File does not exist.
}


/* =========================================================
   DOWNLOAD POSTER
   ========================================================= */

const poster =
  await downloadPoster(
    cleanValue(
      movie.Poster
    ),
    slug
  );


/* =========================================================
   NORMALISE METADATA
   ========================================================= */

const genre =
  splitList(
    movie.Genre
  );

const actors =
  splitList(
    movie.Actors
  );

const languages =
  splitList(
    movie.Language
  );

const countries =
  splitList(
    movie.Country
  );

const director =
  cleanValue(
    movie.Director
  );

const runtime =
  cleanValue(
    movie.Runtime
  );

const plot =
  cleanValue(
    movie.Plot
  );

const awards =
  cleanValue(
    movie.Awards
  );

const imdbRating =
  cleanValue(
    movie.imdbRating
  );

const imdbVotes =
  cleanValue(
    movie.imdbVotes
  );

const rated =
  cleanValue(
    movie.Rated
  );

const released =
  cleanValue(
    movie.Released
  );

const mediaType =
  cleanValue(
    movie.Type
  ) ??
  "movie";

const addedAt =
  new Date()
    .toISOString();


/* =========================================================
   CREATE MARKDOWN
   ========================================================= */

const markdown =
`---
title: ${yamlString(title)}
year: ${yamlString(year)}
imdbId: ${yamlString(imdbId)}
director: ${yamlString(director)}
runtime: ${yamlString(runtime)}
genre: ${yamlArray(genre)}
actors: ${yamlArray(actors)}
plot: ${yamlString(plot)}
language: ${yamlArray(languages)}
country: ${yamlArray(countries)}
awards: ${yamlString(awards)}
poster: ${yamlString(poster)}
imdbRating: ${yamlString(imdbRating)}
imdbVotes: ${yamlString(imdbVotes)}
rated: ${yamlString(rated)}
released: ${yamlString(released)}
type: ${yamlString(mediaType)}

status: "watchlist"
favourite: false
myRating: null
shelf: "Unsorted"
tags: ${yamlArray(genre)}
addedAt: ${yamlString(addedAt)}
---

Write your personal note about ${title} here.
`;


await fs.mkdir(
  moviesDirectory,
  {
    recursive: true,
  }
);

await fs.writeFile(
  markdownPath,
  markdown,
  "utf8"
);


/* =========================================================
   SUCCESS
   ========================================================= */

console.log(
  ""
);

console.log(
  "MOVIE IMPORT COMPLETE"
);

console.log(
  "---------------------"
);

console.log(
  `Title:    ${title}`
);

console.log(
  `Year:     ${year}`
);

console.log(
  `Director: ${director ?? "Unknown"}`
);

console.log(
  `IMDb:     ${imdbRating ?? "N/A"}`
);

console.log(
  `IMDb ID:  ${imdbId}`
);

console.log(
  ""
);

console.log(
  `Created: src/content/movies/${slug}.md`
);

if (
  poster
) {
  console.log(
    `Poster:  ${poster}`
  );
}

console.log(
  ""
);

console.log(
  "You can now edit the Markdown file in VS Code or Obsidian."
);

console.log(
  ""
);