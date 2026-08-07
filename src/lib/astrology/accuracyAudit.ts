import {
  calculateBirthChart,
} from "./calculations";

import type {
  AccuracyFixture,
  AccuracyReferenceBody,
  ReferenceBodyName,
} from "./accuracyFixtures";

import {
  accuracyFixtures,
} from "./accuracyFixtures";

import type {
  BirthChartResult,
  PlanetPosition,
} from "./types";

/* =========================================================
   TOLERANCES
========================================================= */

/*
 * We are intentionally stricter than what is
 * visually noticeable.
 *
 * Planetary longitude:
 * 3 arcminutes
 *
 * Ascendant:
 * 6 arcminutes
 *
 * Lahiri ayanamsha:
 * 1 arcminute
 *
 * UTC:
 * exact to 1 second
 */

export const auditTolerances = {
  planetArcminutes:
    3,

  ascendantArcminutes:
    6,

  ayanamshaArcminutes:
    1,

  utcSeconds:
    1,
} as const;

/* =========================================================
   RESULT TYPES
========================================================= */

export interface BodyAuditResult {
  name:
    ReferenceBodyName;

  expectedLongitude:
    number;

  actualLongitude:
    number;

  longitudeErrorDegrees:
    number;

  longitudeErrorArcminutes:
    number;

  longitudePassed:
    boolean;

  expectedDisplay:
    string;

  actualDisplay:
    string;

  signPassed:
    boolean;

  housePassed:
    boolean;

  nakshatraPassed:
    boolean;

  padaPassed:
    boolean;

  retrogradePassed:
    boolean;

  structurePassed:
    boolean;

  passed:
    boolean;
}

export interface FixtureAuditResult {
  fixture:
    AccuracyFixture;

  calculated?:
    BirthChartResult;

  bodyResults:
    BodyAuditResult[];

  utcPassed:
    boolean;

  expectedUtc:
    string;

  actualUtc:
    string;

  utcErrorSeconds:
    number;

  ayanamshaPassed:
    boolean;

  expectedAyanamsha:
    number;

  actualAyanamsha:
    number;

  ayanamshaErrorArcminutes:
    number;

  passed:
    boolean;

  error?: string;
}

export interface AccuracyAuditReport {
  fixtures:
    FixtureAuditResult[];

  totalFixtures:
    number;

  passedFixtures:
    number;

  failedFixtures:
    number;

  totalBodies:
    number;

  passedBodies:
    number;

  failedBodies:
    number;

  passed:
    boolean;
}

/* =========================================================
   ANGLE HELPERS
========================================================= */

const normalizeDegrees = (
  value: number
): number => {
  return (
    (
      value %
      360
    ) +
    360
  ) % 360;
};

const angularDifference = (
  first:
    number,

  second:
    number
): number => {
  let difference =
    Math.abs(
      normalizeDegrees(
        first
      ) -
      normalizeDegrees(
        second
      )
    );

  if (
    difference >
    180
  ) {
    difference =
      360 -
      difference;
  }

  return difference;
};

/* =========================================================
   DISPLAY HELPERS
========================================================= */

export const formatAbsoluteLongitude = (
  longitude:
    number
): string => {
  const normalized =
    normalizeDegrees(
      longitude
    );

  const signNumber =
    Math.floor(
      normalized /
      30
    ) +
    1;

  const degreeInSign =
    normalized %
    30;

  let degrees =
    Math.floor(
      degreeInSign
    );

  let minutes =
    Math.round(
      (
        degreeInSign -
        degrees
      ) *
      60
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

  const signs = [
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
  ];

  return (
    `${signs[
      signNumber -
      1
    ]} ` +
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

export const formatArcminutes = (
  value:
    number
): string => {
  return (
    `${value.toFixed(
      2
    )}′`
  );
};

/* =========================================================
   BODY LOOKUP
========================================================= */

const findCalculatedBody = (
  result:
    BirthChartResult,

  name:
    ReferenceBodyName
) => {
  if (
    name ===
    "Ascendant"
  ) {
    return result.ascendant;
  }

  return result.planets.find(
    (
      planet
    ) =>
      planet.name ===
      name
  );
};

/* =========================================================
   RETROGRADE CHECK
========================================================= */

const compareRetrograde = (
  reference:
    AccuracyReferenceBody,

  calculated:
    PlanetPosition |
    BirthChartResult[
      "ascendant"
    ]
): boolean => {
  if (
    reference.name ===
    "Ascendant"
  ) {
    return true;
  }

  if (
    !(
      "retrograde" in
      calculated
    )
  ) {
    return false;
  }

  return (
    calculated.retrograde ===
    Boolean(
      reference.retrograde
    )
  );
};

/* =========================================================
   SINGLE BODY AUDIT
========================================================= */

const auditBody = (
  reference:
    AccuracyReferenceBody,

  result:
    BirthChartResult
): BodyAuditResult => {
  const calculated =
    findCalculatedBody(
      result,
      reference.name
    );

  if (
    !calculated
  ) {
    return {
      name:
        reference.name,

      expectedLongitude:
        reference.longitude,

      actualLongitude:
        Number.NaN,

      longitudeErrorDegrees:
        Number.POSITIVE_INFINITY,

      longitudeErrorArcminutes:
        Number.POSITIVE_INFINITY,

      longitudePassed:
        false,

      expectedDisplay:
        formatAbsoluteLongitude(
          reference.longitude
        ),

      actualDisplay:
        "MISSING",

      signPassed:
        false,

      housePassed:
        false,

      nakshatraPassed:
        false,

      padaPassed:
        false,

      retrogradePassed:
        false,

      structurePassed:
        false,

      passed:
        false,
    };
  }

  const longitudeErrorDegrees =
    angularDifference(
      calculated.longitude,
      reference.longitude
    );

  const longitudeErrorArcminutes =
    longitudeErrorDegrees *
    60;

  const tolerance =
    reference.name ===
    "Ascendant"
      ? auditTolerances
          .ascendantArcminutes
      : auditTolerances
          .planetArcminutes;

  const longitudePassed =
    longitudeErrorArcminutes <=
    tolerance;

  const signPassed =
    calculated.signNumber ===
      reference.signNumber &&
    calculated.signName ===
      reference.signName;

  const housePassed =
    calculated.house ===
    reference.house;

  const nakshatraPassed =
    calculated.nakshatra ===
    reference.nakshatra;

  const padaPassed =
    calculated.pada ===
    reference.pada;

  const retrogradePassed =
    compareRetrograde(
      reference,
      calculated
    );

  const structurePassed =
    signPassed &&
    housePassed &&
    nakshatraPassed &&
    padaPassed &&
    retrogradePassed;

  return {
    name:
      reference.name,

    expectedLongitude:
      reference.longitude,

    actualLongitude:
      calculated.longitude,

    longitudeErrorDegrees,

    longitudeErrorArcminutes,

    longitudePassed,

    expectedDisplay:
      formatAbsoluteLongitude(
        reference.longitude
      ),

    actualDisplay:
      formatAbsoluteLongitude(
        calculated.longitude
      ),

    signPassed,

    housePassed,

    nakshatraPassed,

    padaPassed,

    retrogradePassed,

    structurePassed,

    passed:
      longitudePassed &&
      structurePassed,
  };
};

/* =========================================================
   UTC AUDIT
========================================================= */

const calculateUtcDifferenceSeconds = (
  expected:
    string,

  actual:
    string
): number => {
  const expectedTime =
    new Date(
      expected
    ).getTime();

  const actualTime =
    new Date(
      actual
    ).getTime();

  return (
    Math.abs(
      actualTime -
      expectedTime
    ) /
    1000
  );
};

/* =========================================================
   SINGLE FIXTURE
========================================================= */

export const auditFixture = (
  fixture:
    AccuracyFixture
): FixtureAuditResult => {
  try {
    const calculated =
      calculateBirthChart(
        fixture.input
      );

    const bodyResults =
      fixture.referenceBodies.map(
        (
          body
        ) =>
          auditBody(
            body,
            calculated
          )
      );

    const utcErrorSeconds =
      calculateUtcDifferenceSeconds(
        fixture.expectedUtc,

        calculated.calculation
          .utcDateTime
      );

    const utcPassed =
      utcErrorSeconds <=
      auditTolerances
        .utcSeconds;

    const ayanamshaDifference =
      angularDifference(
        fixture.expectedAyanamsha,

        calculated.calculation
          .ayanamshaDegrees
      );

    const ayanamshaErrorArcminutes =
      ayanamshaDifference *
      60;

    const ayanamshaPassed =
      ayanamshaErrorArcminutes <=
      auditTolerances
        .ayanamshaArcminutes;

    const bodiesPassed =
      bodyResults.every(
        (
          body
        ) =>
          body.passed
      );

    return {
      fixture,

      calculated,

      bodyResults,

      utcPassed,

      expectedUtc:
        fixture.expectedUtc,

      actualUtc:
        calculated.calculation
          .utcDateTime,

      utcErrorSeconds,

      ayanamshaPassed,

      expectedAyanamsha:
        fixture.expectedAyanamsha,

      actualAyanamsha:
        calculated.calculation
          .ayanamshaDegrees,

      ayanamshaErrorArcminutes,

      passed:
        utcPassed &&
        ayanamshaPassed &&
        bodiesPassed,
    };
  } catch (
    error
  ) {
    return {
      fixture,

      bodyResults:
        [],

      utcPassed:
        false,

      expectedUtc:
        fixture.expectedUtc,

      actualUtc:
        "CALCULATION FAILED",

      utcErrorSeconds:
        Number.POSITIVE_INFINITY,

      ayanamshaPassed:
        false,

      expectedAyanamsha:
        fixture.expectedAyanamsha,

      actualAyanamsha:
        Number.NaN,

      ayanamshaErrorArcminutes:
        Number.POSITIVE_INFINITY,

      passed:
        false,

      error:
        error instanceof
          Error
          ? error.message
          : "Unknown calculation error",
    };
  }
};

/* =========================================================
   COMPLETE AUDIT
========================================================= */

export const runAccuracyAudit =
  (): AccuracyAuditReport => {
    const fixtureResults =
      accuracyFixtures.map(
        (
          fixture
        ) =>
          auditFixture(
            fixture
          )
      );

    const bodyResults =
      fixtureResults.flatMap(
        (
          fixture
        ) =>
          fixture.bodyResults
      );

    const passedFixtures =
      fixtureResults.filter(
        (
          fixture
        ) =>
          fixture.passed
      ).length;

    const passedBodies =
      bodyResults.filter(
        (
          body
        ) =>
          body.passed
      ).length;

    return {
      fixtures:
        fixtureResults,

      totalFixtures:
        fixtureResults.length,

      passedFixtures,

      failedFixtures:
        fixtureResults.length -
        passedFixtures,

      totalBodies:
        bodyResults.length,

      passedBodies,

      failedBodies:
        bodyResults.length -
        passedBodies,

      passed:
        passedFixtures ===
        fixtureResults.length,
    };
  };