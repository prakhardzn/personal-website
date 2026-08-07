import type {
  BirthChartResult,
  PlanetName,
} from "./types";

/* =========================================================
   ZODIAC
========================================================= */

const zodiacSigns = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

/* =========================================================
   PUBLIC TYPES
========================================================= */

export type DivisionalChartCode =
  | "D7"
  | "D9"
  | "D10"
  | "D12";

export type DivisionalChartName =
  | "Saptamsa"
  | "Navamsa"
  | "Dashamsa"
  | "Dwadashamsa";

export interface DivisionalChartPosition {
  name:
    | "Ascendant"
    | PlanetName;

  abbreviation:
    string;

  /*
   * Original D1 position.
   */
  sourceLongitude:
    number;

  sourceSignNumber:
    number;

  sourceSignName:
    string;

  sourceFormattedDegree:
    string;

  /*
   * Divisional-chart position.
   */
  longitude:
    number;

  signNumber:
    number;

  signName:
    string;

  degreeInSign:
    number;

  formattedDegree:
    string;

  house:
    number;

  /*
   * Which subdivision of the natal
   * sign contains this position.
   *
   * D7  -> 1 through 7
   * D9  -> 1 through 9
   * D10 -> 1 through 10
   * D12 -> 1 through 12
   */
  divisionNumber:
    number;

  /*
   * Kept for backwards compatibility
   * with Chapter 8.
   */
  navamsaNumber?:
    number;

  retrograde?:
    boolean;
}

export interface DivisionalChartResult {
  code:
    DivisionalChartCode;

  division:
    number;

  name:
    DivisionalChartName;

  segmentSpanDegrees:
    number;

  segmentLabel:
    string;

  sourceChartId:
    string;

  generatedAt:
    string;

  ascendant:
    DivisionalChartPosition;

  planets:
    DivisionalChartPosition[];

  notes:
    string[];
}

/* =========================================================
   INTERNAL DEFINITION
========================================================= */

interface VargaDefinition {
  code:
    DivisionalChartCode;

  division:
    number;

  name:
    DivisionalChartName;

  getStartingSign:
    (
      sourceSignNumber:
        number
    ) => number;

  notes:
    string[];
}

/* =========================================================
   NORMALIZATION
========================================================= */

const normalizeDegrees = (
  value:
    number
): number => {
  return (
    (
      value %
      360
    ) +
    360
  ) % 360;
};

const normalizeSignNumber = (
  value:
    number
): number => {
  return (
    (
      (
        value -
        1
      ) %
      12 +
      12
    ) %
    12
  ) + 1;
};

/* =========================================================
   SIGN HELPERS
========================================================= */

const isOddSign = (
  signNumber:
    number
): boolean => {
  return (
    signNumber %
      2 ===
    1
  );
};

const movableSigns =
  new Set<number>([
    1,
    4,
    7,
    10,
  ]);

const fixedSigns =
  new Set<number>([
    2,
    5,
    8,
    11,
  ]);

/* =========================================================
   D7 — SAPTAMSA

   Odd signs:
   begin from the same sign.

   Even signs:
   begin from the seventh sign from
   the source sign.
========================================================= */

const getSaptamsaStartingSign = (
  sourceSignNumber:
    number
): number => {
  if (
    isOddSign(
      sourceSignNumber
    )
  ) {
    return sourceSignNumber;
  }

  /*
   * Seventh sign counted inclusively:
   *
   * source + 6
   */
  return normalizeSignNumber(
    sourceSignNumber +
      6
  );
};

/* =========================================================
   D9 — NAVAMSA

   Movable:
   same sign.

   Fixed:
   ninth sign.

   Dual:
   fifth sign.
========================================================= */

const getNavamsaStartingSign = (
  sourceSignNumber:
    number
): number => {
  if (
    movableSigns.has(
      sourceSignNumber
    )
  ) {
    return sourceSignNumber;
  }

  if (
    fixedSigns.has(
      sourceSignNumber
    )
  ) {
    return normalizeSignNumber(
      sourceSignNumber +
        8
    );
  }

  return normalizeSignNumber(
    sourceSignNumber +
      4
  );
};

/* =========================================================
   D10 — DASHAMSA

   Odd signs:
   begin from the same sign.

   Even signs:
   begin from the ninth sign.
========================================================= */

const getDashamsaStartingSign = (
  sourceSignNumber:
    number
): number => {
  if (
    isOddSign(
      sourceSignNumber
    )
  ) {
    return sourceSignNumber;
  }

  return normalizeSignNumber(
    sourceSignNumber +
      8
  );
};

/* =========================================================
   D12 — DWADASHAMSA

   Every sign begins from itself.
========================================================= */

const getDwadashamsaStartingSign = (
  sourceSignNumber:
    number
): number => {
  return sourceSignNumber;
};

/* =========================================================
   VARGA DEFINITIONS
========================================================= */

const definitions:
  Record<
    DivisionalChartCode,
    VargaDefinition
  > = {
  D7: {
    code:
      "D7",

    division:
      7,

    name:
      "Saptamsa",

    getStartingSign:
      getSaptamsaStartingSign,

    notes: [
      "D7 divides each natal sign into seven equal Saptamsas.",
      "Each Saptamsa spans approximately 4°17′09″.",
      "For odd signs the sequence begins from the natal sign itself.",
      "For even signs the sequence begins from the seventh sign from the natal sign.",
      "D7 is derived directly from the audited sidereal D1 longitudes.",
    ],
  },

  D9: {
    code:
      "D9",

    division:
      9,

    name:
      "Navamsa",

    getStartingSign:
      getNavamsaStartingSign,

    notes: [
      "Each natal sign is divided into nine Navamsas of 3°20′.",
      "Movable signs begin from the same sign.",
      "Fixed signs begin from the ninth sign.",
      "Dual signs begin from the fifth sign.",
      "D9 is derived directly from the audited sidereal D1 longitudes.",
    ],
  },

  D10: {
    code:
      "D10",

    division:
      10,

    name:
      "Dashamsa",

    getStartingSign:
      getDashamsaStartingSign,

    notes: [
      "D10 divides each natal sign into ten equal Dashamsas of 3°.",
      "For odd signs the sequence begins from the natal sign itself.",
      "For even signs the sequence begins from the ninth sign from the natal sign.",
      "D10 is derived directly from the audited sidereal D1 longitudes.",
    ],
  },

  D12: {
    code:
      "D12",

    division:
      12,

    name:
      "Dwadashamsa",

    getStartingSign:
      getDwadashamsaStartingSign,

    notes: [
      "D12 divides every natal sign into twelve equal Dwadashamsas of 2°30′.",
      "The first Dwadashamsa begins from the natal sign itself.",
      "Each following division advances one zodiac sign.",
      "D12 is derived directly from the audited sidereal D1 longitudes.",
    ],
  },
};

/* =========================================================
   DEGREE FORMAT
========================================================= */

const formatDegree = (
  degreeInSign:
    number
): string => {
  const normalized =
    Math.max(
      0,
      Math.min(
        29.999999999,
        degreeInSign
      )
    );

  let degrees =
    Math.floor(
      normalized
    );

  const rawMinutes =
    (
      normalized -
      degrees
    ) *
    60;

  let minutes =
    Math.round(
      rawMinutes
    );

  if (
    minutes ===
    60
  ) {
    minutes =
      0;

    degrees +=
      1;
  }

  if (
    degrees >=
    30
  ) {
    degrees =
      29;

    minutes =
      59;
  }

  return (
    `${String(
      degrees
    ).padStart(
      2,
      "0"
    )}°` +
    `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}′`
  );
};

/* =========================================================
   SEGMENT FORMAT
========================================================= */

const formatSegmentSpan = (
  degreesValue:
    number
): string => {
  let degrees =
    Math.floor(
      degreesValue
    );

  const minutesValue =
    (
      degreesValue -
      degrees
    ) *
    60;

  let minutes =
    Math.floor(
      minutesValue
    );

  let seconds =
    Math.round(
      (
        minutesValue -
        minutes
      ) *
      60
    );

  if (
    seconds ===
    60
  ) {
    seconds =
      0;

    minutes +=
      1;
  }

  if (
    minutes ===
    60
  ) {
    minutes =
      0;

    degrees +=
      1;
  }

  if (
    seconds ===
    0
  ) {
    return (
      `${degrees}°` +
      `${String(
        minutes
      ).padStart(
        2,
        "0"
      )}′`
    );
  }

  return (
    `${degrees}°` +
    `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}′` +
    `${String(
      seconds
    ).padStart(
      2,
      "0"
    )}″`
  );
};

/* =========================================================
   WHOLE SIGN HOUSE
========================================================= */

const getWholeSignHouse = (
  planetSignNumber:
    number,

  ascendantSignNumber:
    number
): number => {
  return (
    (
      (
        planetSignNumber -
        ascendantSignNumber +
        12
      ) %
      12
    ) +
    1
  );
};

/* =========================================================
   GENERIC DIVISION
========================================================= */

const deriveDivisionalPosition = (
  sourceLongitude:
    number,

  definition:
    VargaDefinition
) => {
  const longitude =
    normalizeDegrees(
      sourceLongitude
    );

  const sourceSignNumber =
    Math.floor(
      longitude /
      30
    ) +
    1;

  const degreeWithinSourceSign =
    longitude %
    30;

  const segmentSpan =
    30 /
    definition.division;

  const divisionIndex =
    Math.min(
      definition.division -
        1,

      Math.floor(
        degreeWithinSourceSign /
        segmentSpan
      )
    );

  const divisionNumber =
    divisionIndex +
    1;

  const startingSign =
    definition
      .getStartingSign(
        sourceSignNumber
      );

  const signNumber =
    normalizeSignNumber(
      startingSign +
        divisionIndex
    );

  /*
   * Find position within the current
   * varga segment.
   */
  const degreeWithinSegment =
    degreeWithinSourceSign -
    divisionIndex *
      segmentSpan;

  /*
   * Stretch that segment to a full
   * 30-degree divisional sign.
   */
  const degreeInSign =
    degreeWithinSegment *
    definition.division;

  const divisionalLongitude =
    normalizeDegrees(
      (
        signNumber -
        1
      ) *
        30 +
        degreeInSign
    );

  return {
    longitude:
      divisionalLongitude,

    signNumber,

    signName:
      zodiacSigns[
        signNumber -
        1
      ],

    degreeInSign,

    formattedDegree:
      formatDegree(
        degreeInSign
      ),

    divisionNumber,

    navamsaNumber:
      definition.code ===
      "D9"
        ? divisionNumber
        : undefined,
  };
};

/* =========================================================
   GENERIC VARGA CALCULATOR
========================================================= */

export const calculateDivisionalChart = (
  birthChart:
    BirthChartResult,

  code:
    DivisionalChartCode
): DivisionalChartResult => {
  const definition =
    definitions[
      code
    ];

  /* =======================================================
     ASCENDANT
  ======================================================= */

  const ascendantBase =
    deriveDivisionalPosition(
      birthChart
        .ascendant
        .longitude,

      definition
    );

  const ascendant:
    DivisionalChartPosition = {
    name:
      "Ascendant",

    abbreviation:
      "ASC",

    sourceLongitude:
      birthChart
        .ascendant
        .longitude,

    sourceSignNumber:
      birthChart
        .ascendant
        .signNumber,

    sourceSignName:
      birthChart
        .ascendant
        .signName,

    sourceFormattedDegree:
      birthChart
        .ascendant
        .formattedDegree,

    ...ascendantBase,

    house:
      1,
  };

  /* =======================================================
     PLANETS
  ======================================================= */

  const planets =
    birthChart.planets.map(
      (
        planet
      ):
        DivisionalChartPosition => {
        const derived =
          deriveDivisionalPosition(
            planet.longitude,
            definition
          );

        return {
          name:
            planet.name,

          abbreviation:
            planet.abbreviation,

          sourceLongitude:
            planet.longitude,

          sourceSignNumber:
            planet.signNumber,

          sourceSignName:
            planet.signName,

          sourceFormattedDegree:
            planet.formattedDegree,

          ...derived,

          house:
            getWholeSignHouse(
              derived
                .signNumber,

              ascendant
                .signNumber
            ),

          retrograde:
            planet.retrograde,
        };
      }
    );

  const segmentSpanDegrees =
    30 /
    definition.division;

  return {
    code:
      definition.code,

    division:
      definition.division,

    name:
      definition.name,

    segmentSpanDegrees,

    segmentLabel:
      formatSegmentSpan(
        segmentSpanDegrees
      ),

    sourceChartId:
      birthChart.id,

    generatedAt:
      birthChart.generatedAt,

    ascendant,

    planets,

    notes:
      definition.notes,
  };
};

/* =========================================================
   CONVENIENCE WRAPPERS
========================================================= */

export const calculateSaptamsaChart = (
  birthChart:
    BirthChartResult
): DivisionalChartResult => {
  return calculateDivisionalChart(
    birthChart,
    "D7"
  );
};

export const calculateNavamsaChart = (
  birthChart:
    BirthChartResult
): DivisionalChartResult => {
  return calculateDivisionalChart(
    birthChart,
    "D9"
  );
};

export const calculateDashamsaChart = (
  birthChart:
    BirthChartResult
): DivisionalChartResult => {
  return calculateDivisionalChart(
    birthChart,
    "D10"
  );
};

export const calculateDwadashamsaChart = (
  birthChart:
    BirthChartResult
): DivisionalChartResult => {
  return calculateDivisionalChart(
    birthChart,
    "D12"
  );
};