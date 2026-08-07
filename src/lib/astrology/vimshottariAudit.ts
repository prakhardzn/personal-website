import {
  accuracyFixtures,
} from "./accuracyFixtures";

import {
  calculateBirthChart,
} from "./calculations";

import {
  calculateVimshottariDasha,
  VIMSHOTTARI_SEQUENCE,
  VIMSHOTTARI_CYCLE_YEARS,
} from "./vimshottari";

import type {
  DashaLord,
} from "./vimshottari";

/* =========================================================
   FIXED AUDIT DATE

   We deliberately do NOT use new Date() here.
   Otherwise the expected current Mahadasha /
   Antardasha would change over time and make
   the audit unstable.
========================================================= */

export const DASHA_AUDIT_DATE =
  "2026-08-07T00:00:00.000Z";

/* =========================================================
   EXPECTED VIMSHOTTARI ORDER
========================================================= */

const expectedSequence:
  readonly DashaLord[] = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
];

/* =========================================================
   REFERENCE DATA

   These references are intentionally stored
   independently from vimshottari.ts.

   The Moon longitudes come from the already
   audited D1 reference fixtures.

   Dasha dates use the same explicit convention
   used by our calculator:

   1 Vimshottari year = 365.25 days.
========================================================= */

interface DashaAuditReference {
  fixtureId: string;

  moonNakshatra:
    string;

  birthMahadasha:
    DashaLord;

  birthBalanceYears:
    number;

  birthAntardasha:
    DashaLord;

  birthMahadashaStart:
    string;

  birthMahadashaEnd:
    string;

  currentMahadasha:
    DashaLord;

  currentAntardasha:
    DashaLord;

  currentMahadashaStart:
    string;

  currentMahadashaEnd:
    string;

  currentAntardashaStart:
    string;

  currentAntardashaEnd:
    string;
}

const references:
  DashaAuditReference[] = [
  {
    fixtureId:
      "mumbai-2003-11-01",

    moonNakshatra:
      "Shravana",

    birthMahadasha:
      "Moon",

    birthBalanceYears:
      4.441955893745572,

    birthAntardasha:
      "Saturn",

    birthMahadashaStart:
      "1998-04-11T07:56:07.312Z",

    birthMahadashaEnd:
      "2008-04-10T19:56:07.312Z",

    currentMahadasha:
      "Rahu",

    currentAntardasha:
      "Ketu",

    currentMahadashaStart:
      "2015-04-11T13:56:07.312Z",

    currentMahadashaEnd:
      "2033-04-11T01:56:07.312Z",

    currentAntardashaStart:
      "2025-10-10T16:56:07.312Z",

    currentAntardashaEnd:
      "2026-10-29T05:14:07.312Z",
  },

  {
    fixtureId:
      "london-1990-06-15",

    moonNakshatra:
      "Purva Bhadrapada",

    birthMahadasha:
      "Jupiter",

    birthBalanceYears:
      14.377179466174402,

    birthAntardasha:
      "Jupiter",

    birthMahadashaStart:
      "1988-10-30T17:51:18.721Z",

    birthMahadashaEnd:
      "2004-10-30T17:51:18.721Z",

    currentMahadasha:
      "Mercury",

    currentAntardasha:
      "Ketu",

    currentMahadashaStart:
      "2023-10-31T11:51:18.721Z",

    currentMahadashaEnd:
      "2040-10-30T17:51:18.721Z",

    currentAntardashaStart:
      "2026-03-29T03:18:18.721Z",

    currentAntardashaEnd:
      "2027-03-26T08:15:18.721Z",
  },

  {
    fixtureId:
      "new-york-1985-02-20",

    moonNakshatra:
      "Shatabhisha",

    birthMahadasha:
      "Rahu",

    birthBalanceYears:
      4.469063570495464,

    birthAntardasha:
      "Venus",

    birthMahadashaStart:
      "1971-08-11T08:33:40.532Z",

    birthMahadashaEnd:
      "1989-08-10T20:33:40.532Z",

    currentMahadasha:
      "Mercury",

    currentAntardasha:
      "Mercury",

    currentMahadashaStart:
      "2024-08-10T14:33:40.532Z",

    currentMahadashaEnd:
      "2041-08-10T20:33:40.532Z",

    currentAntardashaStart:
      "2024-08-10T14:33:40.532Z",

    currentAntardashaEnd:
      "2027-01-07T06:00:40.532Z",
  },
];

/* =========================================================
   TOLERANCES
========================================================= */

export const DASHA_AUDIT_TOLERANCES = {
  balanceYears:
    0.00001,

  dateSeconds:
    1,
} as const;

/* =========================================================
   RESULT TYPES
========================================================= */

export interface DashaAuditCheck {
  name: string;

  expected:
    string;

  actual:
    string;

  passed:
    boolean;

  difference?:
    string;
}

export interface DashaFixtureAudit {
  fixtureId:
    string;

  label:
    string;

  checks:
    DashaAuditCheck[];

  passed:
    boolean;

  error?:
    string;
}

export interface VimshottariAuditReport {
  auditDate:
    string;

  sequencePassed:
    boolean;

  expectedSequence:
    string;

  actualSequence:
    string;

  cycleYears:
    number;

  cyclePassed:
    boolean;

  fixtures:
    DashaFixtureAudit[];

  passedFixtures:
    number;

  failedFixtures:
    number;

  totalFixtures:
    number;

  passed:
    boolean;
}

/* =========================================================
   HELPERS
========================================================= */

const differenceSeconds = (
  expected:
    string,

  actual:
    string
): number => {
  return (
    Math.abs(
      new Date(
        expected
      ).getTime() -
        new Date(
          actual
        ).getTime()
    ) /
    1000
  );
};

const formatSeconds = (
  seconds:
    number
): string => {
  return `${seconds.toFixed(
    3
  )} SEC`;
};

const formatYears = (
  years:
    number
): string => {
  return years.toFixed(
    9
  );
};

const makeStringCheck = (
  name:
    string,

  expected:
    string,

  actual:
    string
): DashaAuditCheck => {
  return {
    name,

    expected,

    actual,

    passed:
      expected ===
      actual,
  };
};

const makeDateCheck = (
  name:
    string,

  expected:
    string,

  actual:
    string
): DashaAuditCheck => {
  const difference =
    differenceSeconds(
      expected,
      actual
    );

  return {
    name,

    expected,

    actual,

    difference:
      formatSeconds(
        difference
      ),

    passed:
      difference <=
      DASHA_AUDIT_TOLERANCES
        .dateSeconds,
  };
};

const makeBalanceCheck = (
  expected:
    number,

  actual:
    number
): DashaAuditCheck => {
  const difference =
    Math.abs(
      expected -
      actual
    );

  return {
    name:
      "BIRTH DASHA BALANCE",

    expected:
      formatYears(
        expected
      ),

    actual:
      formatYears(
        actual
      ),

    difference:
      difference.toFixed(
        9
      ),

    passed:
      difference <=
      DASHA_AUDIT_TOLERANCES
        .balanceYears,
  };
};

/* =========================================================
   SINGLE FIXTURE
========================================================= */

const auditFixture = (
  reference:
    DashaAuditReference
): DashaFixtureAudit => {
  const fixture =
    accuracyFixtures.find(
      (
        candidate
      ) =>
        candidate.id ===
        reference.fixtureId
    );

  if (
    !fixture
  ) {
    return {
      fixtureId:
        reference.fixtureId,

      label:
        reference.fixtureId,

      checks:
        [],

      passed:
        false,

      error:
        "Matching D1 accuracy fixture was not found.",
    };
  }

  try {
    /*
     * D1 is calculated once using the same
     * production calculation engine.
     *
     * The Moon position itself is already
     * validated in Chapter 7.
     */

    const birthChart =
      calculateBirthChart(
        fixture.input
      );

    /*
     * Fixed audit date.
     */

    const dasha =
      calculateVimshottariDasha(
        birthChart,

        new Date(
          DASHA_AUDIT_DATE
        )
      );

    const checks:
      DashaAuditCheck[] = [];

    /* -----------------------------------------------------
       NAKSHATRA
    ----------------------------------------------------- */

    checks.push(
      makeStringCheck(
        "MOON NAKSHATRA",

        reference
          .moonNakshatra,

        dasha
          .moonNakshatra
      )
    );

    /* -----------------------------------------------------
       BIRTH MAHADASHA
    ----------------------------------------------------- */

    checks.push(
      makeStringCheck(
        "BIRTH MAHADASHA",

        reference
          .birthMahadasha,

        dasha
          .birthMahadashaLord
      )
    );

    /* -----------------------------------------------------
       BALANCE
    ----------------------------------------------------- */

    checks.push(
      makeBalanceCheck(
        reference
          .birthBalanceYears,

        dasha
          .birthBalanceYears
      )
    );

    /* -----------------------------------------------------
       BIRTH ANTARDASHA
    ----------------------------------------------------- */

    checks.push(
      makeStringCheck(
        "BIRTH ANTARDASHA",

        reference
          .birthAntardasha,

        dasha
          .birthAntardasha
          ?.lord ??
          "MISSING"
      )
    );

    /* -----------------------------------------------------
       BIRTH MAHADASHA BOUNDARIES
    ----------------------------------------------------- */

    checks.push(
      makeDateCheck(
        "BIRTH MAHADASHA START",

        reference
          .birthMahadashaStart,

        dasha
          .birthMahadashaFullStart
      )
    );

    checks.push(
      makeDateCheck(
        "BIRTH MAHADASHA END",

        reference
          .birthMahadashaEnd,

        dasha
          .birthMahadashaEnd
      )
    );

    /* -----------------------------------------------------
       CURRENT MAHADASHA
    ----------------------------------------------------- */

    checks.push(
      makeStringCheck(
        "CURRENT MAHADASHA",

        reference
          .currentMahadasha,

        dasha
          .currentMahadasha
          ?.lord ??
          "MISSING"
      )
    );

    /* -----------------------------------------------------
       CURRENT ANTARDASHA
    ----------------------------------------------------- */

    checks.push(
      makeStringCheck(
        "CURRENT ANTARDASHA",

        reference
          .currentAntardasha,

        dasha
          .currentAntardasha
          ?.lord ??
          "MISSING"
      )
    );

    /* -----------------------------------------------------
       CURRENT PERIOD DATES
    ----------------------------------------------------- */

    checks.push(
      makeDateCheck(
        "CURRENT MAHADASHA START",

        reference
          .currentMahadashaStart,

        dasha
          .currentMahadasha
          ?.fullStartDate ??
          "INVALID"
      )
    );

    checks.push(
      makeDateCheck(
        "CURRENT MAHADASHA END",

        reference
          .currentMahadashaEnd,

        dasha
          .currentMahadasha
          ?.fullEndDate ??
          "INVALID"
      )
    );

    checks.push(
      makeDateCheck(
        "CURRENT ANTARDASHA START",

        reference
          .currentAntardashaStart,

        dasha
          .currentAntardasha
          ?.fullStartDate ??
          "INVALID"
      )
    );

    checks.push(
      makeDateCheck(
        "CURRENT ANTARDASHA END",

        reference
          .currentAntardashaEnd,

        dasha
          .currentAntardasha
          ?.fullEndDate ??
          "INVALID"
      )
    );

    return {
      fixtureId:
        fixture.id,

      label:
        fixture.label,

      checks,

      passed:
        checks.every(
          (
            check
          ) =>
            check.passed
        ),
    };
  } catch (
    error
  ) {
    return {
      fixtureId:
        fixture.id,

      label:
        fixture.label,

      checks:
        [],

      passed:
        false,

      error:
        error instanceof
          Error
          ? error.message
          : "Unknown Vimshottari audit error.",
    };
  }
};

/* =========================================================
   COMPLETE AUDIT
========================================================= */

export const runVimshottariAudit =
  (): VimshottariAuditReport => {
    const actualSequence =
      VIMSHOTTARI_SEQUENCE.map(
        (
          definition
        ) =>
          definition.lord
      );

    const expectedSequenceText =
      expectedSequence.join(
        " → "
      );

    const actualSequenceText =
      actualSequence.join(
        " → "
      );

    const sequencePassed =
      expectedSequenceText ===
      actualSequenceText;

    const cycleYears =
      VIMSHOTTARI_SEQUENCE.reduce(
        (
          total,
          definition
        ) =>
          total +
          definition.years,

        0
      );

    const cyclePassed =
      cycleYears ===
        VIMSHOTTARI_CYCLE_YEARS &&
      cycleYears ===
        120;

    const fixtureResults =
      references.map(
        (
          reference
        ) =>
          auditFixture(
            reference
          )
      );

    const passedFixtures =
      fixtureResults.filter(
        (
          result
        ) =>
          result.passed
      ).length;

    const failedFixtures =
      fixtureResults.length -
      passedFixtures;

    return {
      auditDate:
        DASHA_AUDIT_DATE,

      sequencePassed,

      expectedSequence:
        expectedSequenceText,

      actualSequence:
        actualSequenceText,

      cycleYears,

      cyclePassed,

      fixtures:
        fixtureResults,

      passedFixtures,

      failedFixtures,

      totalFixtures:
        fixtureResults.length,

      passed:
        sequencePassed &&
        cyclePassed &&
        failedFixtures ===
          0,
    };
  };