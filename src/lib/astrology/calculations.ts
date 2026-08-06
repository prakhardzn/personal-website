import * as Astronomy from "astronomy-engine";

import type {
  AscendantPosition,
  BirthChartInput,
  BirthChartResult,
  PlanetName,
  PlanetPosition,
} from "./types";

import {
  getNakshatraPosition,
} from "./nakshatras";

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

interface PlanetDefinition {
  name: PlanetName;
  abbreviation: string;
  body: Astronomy.Body;
}

interface CalendarParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const planetDefinitions:
  PlanetDefinition[] = [
  {
    name: "Sun",
    abbreviation: "SU",
    body: Astronomy.Body.Sun,
  },
  {
    name: "Moon",
    abbreviation: "MO",
    body: Astronomy.Body.Moon,
  },
  {
    name: "Mars",
    abbreviation: "MA",
    body: Astronomy.Body.Mars,
  },
  {
    name: "Mercury",
    abbreviation: "ME",
    body: Astronomy.Body.Mercury,
  },
  {
    name: "Jupiter",
    abbreviation: "JU",
    body: Astronomy.Body.Jupiter,
  },
  {
    name: "Venus",
    abbreviation: "VE",
    body: Astronomy.Body.Venus,
  },
  {
    name: "Saturn",
    abbreviation: "SA",
    body: Astronomy.Body.Saturn,
  },
];

const millisecondsPerDay =
  86_400_000;

const degreesToRadians = (
  value: number
): number => {
  return value * Math.PI / 180;
};

const radiansToDegrees = (
  value: number
): number => {
  return value * 180 / Math.PI;
};

export const normalizeDegrees = (
  value: number
): number => {
  return (
    (value % 360) +
    360
  ) % 360;
};

const signedAngularDifference = (
  firstLongitude: number,
  secondLongitude: number
): number => {
  let difference =
    normalizeDegrees(
      secondLongitude -
      firstLongitude
    );

  if (difference > 180) {
    difference -= 360;
  }

  return difference;
};

const getJulianDay = (
  date: Date
): number => {
  return (
    date.getTime() /
      millisecondsPerDay +
    2_440_587.5
  );
};

const createUtcTimestamp = (
  parts: CalendarParts
): number => {
  const date = new Date(0);

  date.setUTCFullYear(
    parts.year,
    parts.month - 1,
    parts.day
  );

  date.setUTCHours(
    parts.hour,
    parts.minute,
    parts.second,
    0
  );

  return date.getTime();
};

const parseBirthInput = (
  birthDate: string,
  birthTime: string
): CalendarParts => {
  const dateMatch =
    /^(\d{4})-(\d{2})-(\d{2})$/
      .exec(birthDate);

  const timeMatch =
    /^(\d{2}):(\d{2})(?::(\d{2}))?$/
      .exec(birthTime);

  if (!dateMatch || !timeMatch) {
    throw new BirthChartCalculationError(
      "The birth date or time has an invalid format."
    );
  }

  const parts: CalendarParts = {
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),

    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
    second: Number(
      timeMatch[3] ?? "0"
    ),
  };

  if (
    parts.month < 1 ||
    parts.month > 12 ||
    parts.day < 1 ||
    parts.day > 31 ||
    parts.hour < 0 ||
    parts.hour > 23 ||
    parts.minute < 0 ||
    parts.minute > 59 ||
    parts.second < 0 ||
    parts.second > 59
  ) {
    throw new BirthChartCalculationError(
      "The birth date or time contains an invalid value."
    );
  }

  const validationDate = new Date(
    createUtcTimestamp(parts)
  );

  if (
    validationDate.getUTCFullYear() !==
      parts.year ||
    validationDate.getUTCMonth() + 1 !==
      parts.month ||
    validationDate.getUTCDate() !==
      parts.day
  ) {
    throw new BirthChartCalculationError(
      "The entered calendar date does not exist."
    );
  }

  return parts;
};

const getPartsInTimezone = (
  date: Date,
  timezone: string
): CalendarParts => {
  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: timezone,

        year: "numeric",
        month: "2-digit",
        day: "2-digit",

        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",

        hourCycle: "h23",
      }
    );

  const values =
    new Map<string, string>();

  formatter
    .formatToParts(date)
    .forEach((part) => {
      if (
        part.type !== "literal"
      ) {
        values.set(
          part.type,
          part.value
        );
      }
    });

  return {
    year: Number(
      values.get("year")
    ),

    month: Number(
      values.get("month")
    ),

    day: Number(
      values.get("day")
    ),

    hour: Number(
      values.get("hour")
    ),

    minute: Number(
      values.get("minute")
    ),

    second: Number(
      values.get("second")
    ),
  };
};

const calendarPartsMatch = (
  first: CalendarParts,
  second: CalendarParts
): boolean => {
  return (
    first.year === second.year &&
    first.month === second.month &&
    first.day === second.day &&
    first.hour === second.hour &&
    first.minute === second.minute &&
    first.second === second.second
  );
};

const zonedDateTimeToUtc = (
  birthDate: string,
  birthTime: string,
  timezone: string
): Date => {
  const requestedParts =
    parseBirthInput(
      birthDate,
      birthTime
    );

  let candidateTimestamp =
    createUtcTimestamp(
      requestedParts
    );

  /*
   * The candidate is corrected repeatedly until
   * formatting it inside the requested timezone
   * produces the local date and time supplied by
   * the visitor.
   */
  for (
    let attempt = 0;
    attempt < 6;
    attempt += 1
  ) {
    const candidateDate =
      new Date(
        candidateTimestamp
      );

    const displayedParts =
      getPartsInTimezone(
        candidateDate,
        timezone
      );

    const displayedAsUtc =
      createUtcTimestamp(
        displayedParts
      );

    const requestedAsUtc =
      createUtcTimestamp(
        requestedParts
      );

    const correction =
      displayedAsUtc -
      requestedAsUtc;

    candidateTimestamp -=
      correction;

    if (correction === 0) {
      break;
    }
  }

  const result =
    new Date(candidateTimestamp);

  const finalParts =
    getPartsInTimezone(
      result,
      timezone
    );

  if (
    !calendarPartsMatch(
      requestedParts,
      finalParts
    )
  ) {
    throw new BirthChartCalculationError(
      "That local time could not be resolved in the selected timezone. It may fall inside a daylight-saving clock change."
    );
  }

  return result;
};

const getGeneralPrecessionArcseconds = (
  julianCenturies: number
): number => {
  const T =
    julianCenturies;

  return (
    5029.0966 * T +
    1.11113 * T * T -
    0.000006 * T * T * T
  );
};

const getSimplifiedNutationLongitude = (
  julianDay: number
): number => {
  const T =
    (
      julianDay -
      2_451_545
    ) /
    36_525;

  const ascendingNode =
    normalizeDegrees(
      125.04452 -
      1934.136261 * T
    );

  const sunMeanLongitude =
    normalizeDegrees(
      280.4665 +
      36_000.7698 * T
    );

  const moonMeanLongitude =
    normalizeDegrees(
      218.3165 +
      481_267.8813 * T
    );

  const nodeRadians =
    degreesToRadians(
      ascendingNode
    );

  const sunRadians =
    degreesToRadians(
      sunMeanLongitude
    );

  const moonRadians =
    degreesToRadians(
      moonMeanLongitude
    );

  const nutationArcseconds =
    -17.2 *
      Math.sin(nodeRadians) -
    1.32 *
      Math.sin(
        2 * sunRadians
      ) -
    0.23 *
      Math.sin(
        2 * moonRadians
      ) +
    0.21 *
      Math.sin(
        2 * nodeRadians
      );

  return (
    nutationArcseconds /
    3600
  );
};

export const getLahiriAyanamsha = (
  date: Date
): number => {
  /*
   * Official Lahiri anchor:
   *
   * 21 March 1956, 00:00 TDT
   * 23°15′00.658″
   *
   * The open implementation below advances that
   * anchor with the IAU-1976 general-precession
   * polynomial and a compact nutation correction.
   */
  const anchorTrueAyanamsha =
    23 +
    15 / 60 +
    0.658 / 3600;

  const anchorDate =
    new Date(
      Date.UTC(
        1956,
        2,
        21,
        0,
        0,
        0
      )
    );

  const anchorJulianDay =
    getJulianDay(
      anchorDate
    );

  const targetJulianDay =
    getJulianDay(date);

  const anchorT =
    (
      anchorJulianDay -
      2_451_545
    ) /
    36_525;

  const targetT =
    (
      targetJulianDay -
      2_451_545
    ) /
    36_525;

  const anchorNutation =
    getSimplifiedNutationLongitude(
      anchorJulianDay
    );

  const targetNutation =
    getSimplifiedNutationLongitude(
      targetJulianDay
    );

  const anchorMeanAyanamsha =
    anchorTrueAyanamsha -
    anchorNutation;

  const precessionDifference =
    (
      getGeneralPrecessionArcseconds(
        targetT
      ) -
      getGeneralPrecessionArcseconds(
        anchorT
      )
    ) /
    3600;

  return normalizeDegrees(
    anchorMeanAyanamsha +
    precessionDifference +
    targetNutation
  );
};

const getTropicalLongitude = (
  body: Astronomy.Body,
  date: Date
): number => {
  return normalizeDegrees(
    Astronomy.EclipticLongitude(
      body,
      date
    )
  );
};

const getRetrogradeStatus = (
  body: Astronomy.Body,
  date: Date
): boolean => {
  if (
    body === Astronomy.Body.Sun ||
    body === Astronomy.Body.Moon
  ) {
    return false;
  }

  const halfDay =
    12 * 60 * 60 * 1000;

  const beforeDate =
    new Date(
      date.getTime() -
      halfDay
    );

  const afterDate =
    new Date(
      date.getTime() +
      halfDay
    );

  const beforeLongitude =
    getTropicalLongitude(
      body,
      beforeDate
    );

  const afterLongitude =
    getTropicalLongitude(
      body,
      afterDate
    );

  return (
    signedAngularDifference(
      beforeLongitude,
      afterLongitude
    ) < 0
  );
};

const formatDegreeInSign = (
  degreeInSign: number
): string => {
  const normalized =
    normalizeDegrees(
      degreeInSign
    ) % 30;

  const degrees =
    Math.floor(normalized);

  const minutes =
    Math.floor(
      (
        normalized -
        degrees
      ) * 60
    );

  return (
    `${String(degrees).padStart(
      2,
      "0"
    )}°` +
    `${String(minutes).padStart(
      2,
      "0"
    )}′`
  );
};

const createPositionData = (
  longitude: number,
  ascendantSignNumber: number
) => {
  const normalizedLongitude =
    normalizeDegrees(longitude);

  const signNumber =
    Math.floor(
      normalizedLongitude / 30
    ) + 1;

  const degreeInSign =
    normalizedLongitude % 30;

  const house =
    (
      (
        signNumber -
        ascendantSignNumber +
        12
      ) %
      12
    ) + 1;

  const nakshatra =
    getNakshatraPosition(
      normalizedLongitude
    );

  return {
    longitude:
      normalizedLongitude,

    signNumber,

    signName:
      zodiacSigns[
        signNumber - 1
      ],

    degreeInSign,

    formattedDegree:
      formatDegreeInSign(
        degreeInSign
      ),

    house,

    nakshatra:
      nakshatra.name,

    pada:
      nakshatra.pada,
  };
};

const getMeanRahuLongitude = (
  date: Date,
  ayanamsha: number
): number => {
  const julianDay =
    getJulianDay(date);

  const T =
    (
      julianDay -
      2_451_545
    ) /
    36_525;

  const tropicalNode =
    normalizeDegrees(
      125.044555 -
      1934.1361849 * T +
      0.0020762 * T * T +
      (
        T * T * T
      ) / 467_410 -
      (
        T *
        T *
        T *
        T
      ) / 60_616_000
    );

  return normalizeDegrees(
    tropicalNode -
    ayanamsha
  );
};

const getMeanObliquity = (
  julianDay: number
): number => {
  const T =
    (
      julianDay -
      2_451_545
    ) /
    36_525;

  return (
    23.439291111 -
    0.013004167 * T -
    0.000000164 *
      T *
      T +
    0.000000504 *
      T *
      T *
      T
  );
};

const getSiderealAscendant = (
  date: Date,
  latitude: number,
  longitude: number,
  ayanamsha: number
): number => {
  const julianDay =
    getJulianDay(date);

  const obliquity =
    getMeanObliquity(
      julianDay
    );

  const greenwichSiderealDegrees =
    Astronomy.SiderealTime(
      date
    ) * 15;

  const localSiderealDegrees =
    normalizeDegrees(
      greenwichSiderealDegrees +
      longitude
    );

  const theta =
    degreesToRadians(
      localSiderealDegrees
    );

  const epsilon =
    degreesToRadians(
      obliquity
    );

  const latitudeRadians =
    degreesToRadians(
      latitude
    );

  const tropicalAscendant =
    normalizeDegrees(
      radiansToDegrees(
        Math.atan2(
          Math.cos(theta),

          -(
            Math.sin(theta) *
              Math.cos(epsilon) +
            Math.tan(
              latitudeRadians
            ) *
              Math.sin(epsilon)
          )
        )
      )
    );

  return normalizeDegrees(
    tropicalAscendant -
    ayanamsha
  );
};

const calculateAscendant = (
  date: Date,
  latitude: number,
  longitude: number,
  ayanamsha: number
): AscendantPosition => {
  const ascendantLongitude =
    getSiderealAscendant(
      date,
      latitude,
      longitude,
      ayanamsha
    );

  const temporarySignNumber =
    Math.floor(
      ascendantLongitude / 30
    ) + 1;

  const position =
    createPositionData(
      ascendantLongitude,
      temporarySignNumber
    );

  return {
    name: "Ascendant",
    abbreviation: "ASC",
    ...position,
    house: 1,
  };
};

const calculatePlanet = (
  definition: PlanetDefinition,
  date: Date,
  ayanamsha: number,
  ascendantSignNumber: number
): PlanetPosition => {
  const tropicalLongitude =
    getTropicalLongitude(
      definition.body,
      date
    );

  const siderealLongitude =
    normalizeDegrees(
      tropicalLongitude -
      ayanamsha
    );

  const position =
    createPositionData(
      siderealLongitude,
      ascendantSignNumber
    );

  return {
    name: definition.name,
    abbreviation:
      definition.abbreviation,

    ...position,

    retrograde:
      getRetrogradeStatus(
        definition.body,
        date
      ),
  };
};

export class BirthChartCalculationError
  extends Error {
  constructor(message: string) {
    super(message);

    this.name =
      "BirthChartCalculationError";
  }
}

export const calculateBirthChart = (
  input: BirthChartInput
): BirthChartResult => {
  if (
    !Number.isFinite(
      input.latitude
    ) ||
    input.latitude < -90 ||
    input.latitude > 90
  ) {
    throw new BirthChartCalculationError(
      "Latitude must be between -90 and 90."
    );
  }

  if (
    !Number.isFinite(
      input.longitude
    ) ||
    input.longitude < -180 ||
    input.longitude > 180
  ) {
    throw new BirthChartCalculationError(
      "Longitude must be between -180 and 180."
    );
  }

  let utcDate: Date;

  try {
    utcDate =
      zonedDateTimeToUtc(
        input.birthDate,
        input.birthTime,
        input.timezone
      );
  } catch (error) {
    if (
      error instanceof
      BirthChartCalculationError
    ) {
      throw error;
    }

    throw new BirthChartCalculationError(
      "The selected timezone is invalid or unsupported by this browser."
    );
  }

  const ayanamsha =
    getLahiriAyanamsha(
      utcDate
    );

  const ascendant =
    calculateAscendant(
      utcDate,
      input.latitude,
      input.longitude,
      ayanamsha
    );

  const planets =
    planetDefinitions.map(
      (definition) =>
        calculatePlanet(
          definition,
          utcDate,
          ayanamsha,
          ascendant.signNumber
        )
    );

  const rahuLongitude =
    getMeanRahuLongitude(
      utcDate,
      ayanamsha
    );

  const ketuLongitude =
    normalizeDegrees(
      rahuLongitude + 180
    );

  const rahuPosition =
    createPositionData(
      rahuLongitude,
      ascendant.signNumber
    );

  const ketuPosition =
    createPositionData(
      ketuLongitude,
      ascendant.signNumber
    );

  planets.push(
    {
      name: "Rahu",
      abbreviation: "RA",
      ...rahuPosition,
      retrograde: true,
    },
    {
      name: "Ketu",
      abbreviation: "KE",
      ...ketuPosition,
      retrograde: true,
    }
  );

  return {
    id:
      `birth-chart-${Date.now()}`,

    status: "calculated",

    generatedAt:
      new Date().toISOString(),

    input,

    settings: {
      zodiac: "sidereal",
      ayanamsha: "lahiri",
      nodeType: "mean",
      chartStyle:
        "north-indian",
      houseSystem:
        "whole-sign",
    },

    calculation: {
      engine:
        "astronomy-engine",

      engineVersion:
        "2.1.19",

      model:
        "Astronomy Engine + Lahiri approximation",

      utcDateTime:
        utcDate.toISOString(),

      ayanamshaDegrees:
        ayanamsha,

      ayanamshaMethod:
        "Lahiri IAU-1976 anchored approximation",
    },

    ascendant,
    planets,

    warnings: [
      "Planetary longitudes are calculated with Astronomy Engine.",
      "The Lahiri ayanamsha is an openly implemented IAU-1976 anchored approximation, not Swiss Ephemeris.",
      "Rahu and Ketu use the mean lunar node.",
      "Houses use the whole-sign house system.",
      "Historic timezone accuracy depends on the timezone database included with the visitor's browser.",
    ],
  };
};