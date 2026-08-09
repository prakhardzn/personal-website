import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";


/* =========================================================
   PATHS
========================================================= */

const projectRoot =
  process.cwd();

const musicDirectory =
  path.join(
    projectRoot,
    "src",
    "content",
    "music"
  );

const artworkDirectory =
  path.join(
    projectRoot,
    "public",
    "assets",
    "library",
    "music"
  );


/* =========================================================
   API
========================================================= */

const musicBrainzBase =
  "https://musicbrainz.org/ws/2";

const coverArtBase =
  "https://coverartarchive.org";

const userAgent =
  "PrakharPersonalArchive/1.0 (personal academic Astro website)";


/* =========================================================
   ARTISTS
========================================================= */

const artistsToImport = [
  "Daft Punk",
  "Toby Fox",
  "Tame Impala",
  "The Beatles",
  "Maroon 5",
  "Michael Jackson",
  "Queen",
  "Eminem",
  "Dua Lipa",
];


/* =========================================================
   RATE LIMIT
========================================================= */

let lastMusicBrainzRequest =
  0;


function wait(
  milliseconds
) {
  return new Promise(
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds
      );
    }
  );
}


async function waitForMusicBrainz() {
  const now =
    Date.now();

  const elapsed =
    now -
    lastMusicBrainzRequest;

  const minimumGap =
    1150;

  if (
    elapsed <
    minimumGap
  ) {
    await wait(
      minimumGap -
        elapsed
    );
  }

  lastMusicBrainzRequest =
    Date.now();
}


/* =========================================================
   FETCH
========================================================= */

async function musicBrainzFetch(
  url,
  attempt = 1
) {
  await waitForMusicBrainz();

  const response =
    await fetch(
      url,
      {
        headers: {
          "User-Agent":
            userAgent,

          Accept:
            "application/json",
        },
      }
    );


  if (
    (
      response.status ===
        429 ||
      response.status ===
        503
    ) &&
    attempt <= 4
  ) {
    const delay =
      attempt *
      3000;

    console.log(
      `MusicBrainz requested a pause. Waiting ${delay / 1000}s...`
    );

    await wait(
      delay
    );

    return musicBrainzFetch(
      url,
      attempt + 1
    );
  }


  if (
    !response.ok
  ) {
    throw new Error(
      `MusicBrainz returned HTTP ${response.status}`
    );
  }


  return response.json();
}


/* =========================================================
   HELPERS
========================================================= */

function normalise(
  value
) {
  return String(
    value ?? ""
  )
    .normalize(
      "NFKD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      " "
    )
    .trim();
}


function slugify(
  value
) {
  return String(
    value ?? ""
  )
    .normalize(
      "NFKD"
    )
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
    String(
      value
    )
  );
}


function yamlArray(
  values
) {
  return JSON.stringify(
    values ?? []
  );
}


function getYear(
  value
) {
  if (
    !value
  ) {
    return null;
  }

  const result =
    String(
      value
    ).match(
      /^\d{4}/
    );

  return result
    ? result[0]
    : null;
}


async function fileExists(
  target
) {
  try {
    await fs.access(
      target
    );

    return true;
  } catch {
    return false;
  }
}


/* =========================================================
   REMOVE DUPLICATE VERSIONS
========================================================= */

const alternateVersionPattern =
  /(?:live|remaster(?:ed)?|remix|demo|instrumental|karaoke|radio edit|club mix|acoustic version|alternate take|alternative take|backing track)/i;


function isAlternateVersion(
  title
) {
  return alternateVersionPattern.test(
    title
  );
}


/* =========================================================
   FIND ARTIST
========================================================= */

async function findArtist(
  requestedArtist
) {
  const url =
    new URL(
      `${musicBrainzBase}/artist/`
    );

  url.searchParams.set(
    "query",
    `artist:"${requestedArtist}"`
  );

  url.searchParams.set(
    "fmt",
    "json"
  );

  url.searchParams.set(
    "limit",
    "10"
  );


  const data =
    await musicBrainzFetch(
      url
    );

  const artists =
    data.artists ??
    [];


  if (
    artists.length ===
    0
  ) {
    throw new Error(
      `No artist found for ${requestedArtist}`
    );
  }


  const exact =
    artists.find(
      (artist) =>
        normalise(
          artist.name
        ) ===
        normalise(
          requestedArtist
        )
    );


  return (
    exact ??
    artists[0]
  );
}


/* =========================================================
   FETCH RECORDINGS
========================================================= */

async function fetchArtistRecordings(
  artist
) {
  const all =
    [];

  let offset =
    0;

  let total =
    Infinity;


  while (
    offset <
    total
  ) {
    const url =
      new URL(
        `${musicBrainzBase}/recording/`
      );


    url.searchParams.set(
      "query",
      `arid:${artist.id}`
    );

    url.searchParams.set(
      "fmt",
      "json"
    );

    url.searchParams.set(
      "limit",
      "100"
    );

    url.searchParams.set(
      "offset",
      String(
        offset
      )
    );


    const data =
      await musicBrainzFetch(
        url
      );


    const recordings =
      data.recordings ??
      [];


    total =
      Number(
        data.count ??
        recordings.length
      );


    all.push(
      ...recordings
    );


    offset +=
      recordings.length;


    console.log(
      `  received ${Math.min(
        offset,
        total
      )}/${total}`
    );


    if (
      recordings.length ===
      0
    ) {
      break;
    }
  }


  return all;
}


/* =========================================================
   PRIMARY ARTIST CHECK
========================================================= */

function isPrimaryArtist(
  recording,
  artistId
) {
  const credits =
    recording[
      "artist-credit"
    ] ??
    [];


  const firstArtistCredit =
    credits.find(
      (credit) =>
        credit &&
        typeof credit ===
          "object" &&
        credit.artist
    );


  return (
    firstArtistCredit
      ?.artist
      ?.id ===
    artistId
  );
}


/* =========================================================
   RELEASE FILTERING
========================================================= */

function releaseAllowed(
  release
) {
  if (
    release.status &&
    release.status !==
      "Official"
  ) {
    return false;
  }


  const group =
    release[
      "release-group"
    ];


  if (
    !group
  ) {
    return false;
  }


  const primaryType =
    group[
      "primary-type"
    ] ??
    group.primaryType ??
    null;


  if (
    ![
      "Album",
      "Single",
      "EP",
    ].includes(
      primaryType
    )
  ) {
    return false;
  }


  const secondaryTypes =
    group[
      "secondary-types"
    ] ??
    [];


  if (
    secondaryTypes.some(
      (type) =>
        [
          "Compilation",
          "Live",
          "Remix",
        ].includes(
          type
        )
    )
  ) {
    return false;
  }


  return true;
}


function chooseRelease(
  recording
) {
  const releases =
    (
      recording.releases ??
      []
    )
      .filter(
        releaseAllowed
      )
      .sort(
        (
          first,
          second
        ) =>
          (
            first.date ??
            "9999"
          ).localeCompare(
            second.date ??
            "9999"
          )
      );


  return (
    releases[0] ??
    null
  );
}


/* =========================================================
   CLEAN + DEDUPLICATE SONGS
========================================================= */

function prepareSongs(
  recordings,
  artist
) {
  const songs =
    new Map();


  for (
    const recording
    of recordings
  ) {
    const title =
      recording.title
        ?.trim();


    if (
      !title
    ) {
      continue;
    }


    if (
      !isPrimaryArtist(
        recording,
        artist.id
      )
    ) {
      continue;
    }


    if (
      isAlternateVersion(
        title
      )
    ) {
      continue;
    }


    const release =
      chooseRelease(
        recording
      );


    if (
      !release
    ) {
      continue;
    }


    const key =
      normalise(
        title
      );


    const existing =
      songs.get(
        key
      );


    const newDate =
      recording[
        "first-release-date"
      ] ??
      release.date ??
      "9999";


    const existingDate =
      existing
        ? (
            existing[
              "first-release-date"
            ] ??
            existing
              .selectedRelease
              ?.date ??
            "9999"
          )
        : null;


    if (
      !existing ||
      newDate <
        existingDate
    ) {
      songs.set(
        key,
        {
          ...recording,

          selectedRelease:
            release,
        }
      );
    }
  }


  return Array.from(
    songs.values()
  ).sort(
    (
      first,
      second
    ) => {
      const dateA =
        first[
          "first-release-date"
        ] ??
        first
          .selectedRelease
          ?.date ??
        "9999";


      const dateB =
        second[
          "first-release-date"
        ] ??
        second
          .selectedRelease
          ?.date ??
        "9999";


      if (
        dateA !==
        dateB
      ) {
        return dateA.localeCompare(
          dateB
        );
      }


      return first.title.localeCompare(
        second.title
      );
    }
  );
}


/* =========================================================
   COVER ART
========================================================= */

const artworkCache =
  new Map();


async function fetchCover(
  artistName,
  albumName,
  releaseGroupId,
  releaseId
) {
  const identity =
    releaseGroupId ??
    releaseId;


  if (
    !identity
  ) {
    return null;
  }


  if (
    artworkCache.has(
      identity
    )
  ) {
    return artworkCache.get(
      identity
    );
  }


  const artistSlug =
    slugify(
      artistName
    );


  const albumSlug =
    slugify(
      albumName ??
      "release"
    ).slice(
      0,
      60
    );


  const idPart =
    identity.slice(
      0,
      8
    );


  const baseName =
    `${artistSlug}-${albumSlug}-${idPart}`;


  await fs.mkdir(
    artworkDirectory,
    {
      recursive: true,
    }
  );


  const possibleExisting =
    [
      "jpg",
      "png",
      "webp",
    ];


  for (
    const extension
    of possibleExisting
  ) {
    const existingPath =
      path.join(
        artworkDirectory,
        `${baseName}.${extension}`
      );


    if (
      await fileExists(
        existingPath
      )
    ) {
      const existingUrl =
        `/assets/library/music/${baseName}.${extension}`;


      artworkCache.set(
        identity,
        existingUrl
      );


      return existingUrl;
    }
  }


  const sources =
    [];


  if (
    releaseGroupId
  ) {
    sources.push(
      `${coverArtBase}/release-group/${releaseGroupId}/front-500`
    );
  }


  if (
    releaseId
  ) {
    sources.push(
      `${coverArtBase}/release/${releaseId}/front-500`
    );
  }


  for (
    const source
    of sources
  ) {
    try {
      const response =
        await fetch(
          source,
          {
            redirect:
              "follow",

            headers: {
              "User-Agent":
                userAgent,
            },
          }
        );


      if (
        !response.ok
      ) {
        continue;
      }


      const type =
        response.headers
          .get(
            "content-type"
          )
          ?.toLowerCase() ??
        "";


      let extension =
        "jpg";


      if (
        type.includes(
          "png"
        )
      ) {
        extension =
          "png";
      }


      if (
        type.includes(
          "webp"
        )
      ) {
        extension =
          "webp";
      }


      const filename =
        `${baseName}.${extension}`;


      const outputPath =
        path.join(
          artworkDirectory,
          filename
        );


      const buffer =
        Buffer.from(
          await response.arrayBuffer()
        );


      await fs.writeFile(
        outputPath,
        buffer
      );


      const publicUrl =
        `/assets/library/music/${filename}`;


      artworkCache.set(
        identity,
        publicUrl
      );


      return publicUrl;
    } catch {
      // Try next source.
    }
  }


  artworkCache.set(
    identity,
    null
  );


  return null;
}


/* =========================================================
   CREATE MARKDOWN
========================================================= */

async function createSong(
  artist,
  recording
) {
  const release =
    recording.selectedRelease;


  const releaseGroup =
    release?.[
      "release-group"
    ];


  const releaseGroupId =
    releaseGroup?.id ??
    null;


  const releaseId =
    release?.id ??
    null;


  const album =
    release?.title ??
    null;


  const title =
    recording.title;


  const year =
    getYear(
      recording[
        "first-release-date"
      ] ??
      release?.date
    );


  const filename =
    `${slugify(
      artist.name
    )}--${slugify(
      title
    )}.md`;


  const filePath =
    path.join(
      musicDirectory,
      filename
    );


  if (
    await fileExists(
      filePath
    )
  ) {
    return {
      created:
        false,

      title,
    };
  }


  const cover =
    await fetchCover(
      artist.name,
      album,
      releaseGroupId,
      releaseId
    );


  const durationMs =
    typeof recording.length ===
      "number"
      ? recording.length
      : null;


  const tags =
    [
      artist.name,
      album,
    ].filter(
      Boolean
    );


  const markdown =
`---
title: ${yamlString(title)}
artist: ${yamlString(artist.name)}
album: ${yamlString(album)}
year: ${yamlString(year)}
recordingId: ${yamlString(recording.id)}
artistId: ${yamlString(artist.id)}
releaseId: ${yamlString(releaseId)}
releaseGroupId: ${yamlString(releaseGroupId)}
durationMs: ${
  durationMs === null
    ? "null"
    : durationMs
}
cover: ${yamlString(cover)}
status: "saved"
favourite: false
myRating: null
shelf: ${yamlString(artist.name)}
tags: ${yamlArray(tags)}
addedAt: ${yamlString(new Date().toISOString())}
---

Write your personal note about ${title} here.
`;


  await fs.writeFile(
    filePath,
    markdown,
    "utf8"
  );


  return {
    created:
      true,

    title,
  };
}


/* =========================================================
   IMPORT ARTIST
========================================================= */

async function importArtist(
  requestedArtist
) {
  console.log(
    ""
  );

  console.log(
    "=================================================="
  );

  console.log(
    requestedArtist.toUpperCase()
  );

  console.log(
    "=================================================="
  );


  console.log(
    "Finding artist..."
  );


  const artist =
    await findArtist(
      requestedArtist
    );


  console.log(
    `Matched: ${artist.name}`
  );

  console.log(
    `MBID: ${artist.id}`
  );


  console.log(
    ""
  );

  console.log(
    "Fetching recordings..."
  );


  const recordings =
    await fetchArtistRecordings(
      artist
    );


  console.log(
    ""
  );

  console.log(
    `${recordings.length} raw recordings received.`
  );


  const songs =
    prepareSongs(
      recordings,
      artist
    );


  console.log(
    `${songs.length} distinct songs after filtering.`
  );


  let created =
    0;

  let skipped =
    0;


  for (
    let index = 0;
    index < songs.length;
    index += 1
  ) {
    const song =
      songs[index];


    const result =
      await createSong(
        artist,
        song
      );


    if (
      result.created
    ) {
      created +=
        1;

      console.log(
        `+ ${String(
          index + 1
        ).padStart(
          3,
          "0"
        )}/${songs.length} ${result.title}`
      );
    } else {
      skipped +=
        1;

      console.log(
        `= ${result.title} already exists`
      );
    }
  }


  return {
    artist:
      artist.name,

    total:
      songs.length,

    created,

    skipped,
  };
}


/* =========================================================
   MAIN
========================================================= */

async function main() {
  await fs.mkdir(
    musicDirectory,
    {
      recursive: true,
    }
  );


  await fs.mkdir(
    artworkDirectory,
    {
      recursive: true,
    }
  );


  console.log(
    ""
  );

  console.log(
    "AUDIO SIGNALS // DISCography IMPORT"
  );

  console.log(
    "==================================="
  );


  const results =
    [];


  for (
    const artist
    of artistsToImport
  ) {
    try {
      results.push(
        await importArtist(
          artist
        )
      );
    } catch (
      error
    ) {
      console.error(
        ""
      );

      console.error(
        `FAILED: ${artist}`
      );

      console.error(
        error instanceof Error
          ? error.message
          : error
      );


      results.push({
        artist,
        total: 0,
        created: 0,
        skipped: 0,
        failed: true,
      });
    }
  }


  console.log(
    ""
  );

  console.log(
    "=================================================="
  );

  console.log(
    "IMPORT SUMMARY"
  );

  console.log(
    "=================================================="
  );


  let totalSongs =
    0;


  for (
    const result
    of results
  ) {
    console.log(
      `${result.artist}: ${result.total} signals`
    );

    totalSongs +=
      result.total;
  }


  console.log(
    ""
  );

  console.log(
    `TOTAL SIGNALS: ${totalSongs}`
  );

  console.log(
    ""
  );

  console.log(
    "Run:"
  );

  console.log(
    "pnpm astro sync"
  );

  console.log(
    ""
  );
}


main().catch(
  (error) => {
    console.error(
      error
    );

    process.exit(
      1
    );
  }
);