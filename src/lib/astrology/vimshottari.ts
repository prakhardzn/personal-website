import type {
  BirthChartResult,
  PlanetName,
} from "./types";

import {
  nakshatras,
} from "./nakshatras";

/* =========================================================
   CONSTANTS
========================================================= */

export const VIMSHOTTARI_YEAR_DAYS =
  365.25;

export const VIMSHOTTARI_CYCLE_YEARS =
  120;

const DAY_MS =
  86_400_000;

const YEAR_MS =
  VIMSHOTTARI_YEAR_DAYS *
  DAY_MS;

const NAKSHATRA_SPAN =
  360 / 27;

/* =========================================================
   DASHA LORDS
========================================================= */

export type DashaLord =
  PlanetName;

export interface DashaDefinition {
  lord: DashaLord;
  years: number;
}

export const VIMSHOTTARI_SEQUENCE:
  readonly DashaDefinition[] = [
  {
    lord: "Ketu",
    years: 7,
  },

  {
    lord: "Venus",
    years: 20,
  },

  {
    lord: "Sun",
    years: 6,
  },

  {
    lord: "Moon",
    years: 10,
  },

  {
    lord: "Mars",
    years: 7,
  },

  {
    lord: "Rahu",
    years: 18,
  },

  {
    lord: "Jupiter",
    years: 16,
  },

  {
    lord: "Saturn",
    years: 19,
  },

  {
    lord: "Mercury",
    years: 17,
  },
] as const;

/* =========================================================
   PUBLIC TYPES
========================================================= */

export interface AntardashaPeriod {
  id: string;

  mahadashaLord:
    DashaLord;

  lord:
    DashaLord;

  startDate:
    string;

  endDate:
    string;

  fullStartDate:
    string;

  fullEndDate:
    string;

  durationYears:
    number;

  fullDurationYears:
    number;

  containsBirth:
    boolean;

  isCurrent:
    boolean;

  isPartialAtBirth:
    boolean;

  isPartialAtHorizon:
    boolean;
}

export interface MahadashaPeriod {
  id: string;

  lord:
    DashaLord;

  startDate:
    string;

  endDate:
    string;

  fullStartDate:
    string;

  fullEndDate:
    string;

  durationYears:
    number;

  fullDurationYears:
    number;

  containsBirth:
    boolean;

  isCurrent:
    boolean;

  isPartialAtBirth:
    boolean;

  isPartialAtHorizon:
    boolean;

  antardashas:
    AntardashaPeriod[];
}

export interface VimshottariResult {
  system:
    "Vimshottari";

  convention:
    "365.25-day dasha year";

  cycleYears:
    120;

  generatedAt:
    string;

  currentDateTime:
    string;

  birthDateTime:
    string;

  moonLongitude:
    number;

  moonNakshatraIndex:
    number;

  moonNakshatra:
    string;

  moonNakshatraProgress:
    number;

  moonNakshatraRemaining:
    number;

  birthMahadashaLord:
    DashaLord;

  birthMahadashaFullStart:
    string;

  birthMahadashaEnd:
    string;

  birthBalanceYears:
    number;

  birthBalancePercent:
    number;

  birthAntardasha:
    AntardashaPeriod |
    null;

  currentMahadasha:
    MahadashaPeriod |
    null;

  currentAntardasha:
    AntardashaPeriod |
    null;

  timelineEnd:
    string;

  mahadashas:
    MahadashaPeriod[];

  notes:
    string[];
}

/* =========================================================
   INTERNAL TYPES
========================================================= */

interface FullMahadasha {
  id: string;

  lord:
    DashaLord;

  startTimestamp:
    number;

  endTimestamp:
    number;

  fullDurationYears:
    number;
}

interface FullAntardasha {
  id: string;

  mahadashaLord:
    DashaLord;

  lord:
    DashaLord;

  startTimestamp:
    number;

  endTimestamp:
    number;

  fullDurationYears:
    number;
}

/* =========================================================
   ERROR
========================================================= */

export class VimshottariCalculationError
  extends Error {
  constructor(
    message: string
  ) {
    super(message);

    this.name =
      "VimshottariCalculationError";
  }
}

/* =========================================================
   GENERIC HELPERS
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

const yearsToMilliseconds = (
  years: number
): number => {
  return (
    years *
    YEAR_MS
  );
};

const millisecondsToYears = (
  milliseconds: number
): number => {
  return (
    milliseconds /
    YEAR_MS
  );
};

const toIso = (
  timestamp: number
): string => {
  return new Date(
    timestamp
  ).toISOString();
};

const clamp = (
  value: number,
  minimum: number,
  maximum: number
): number => {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );
};

const findDefinitionIndex = (
  lord: DashaLord
): number => {
  const index =
    VIMSHOTTARI_SEQUENCE.findIndex(
      (
        definition
      ) =>
        definition.lord ===
        lord
    );

  if (
    index === -1
  ) {
    throw new VimshottariCalculationError(
      `Unknown Vimshottari lord: ${lord}`
    );
  }

  return index;
};

/* =========================================================
   FULL MAHADASHA GENERATOR
========================================================= */

const generateFullMahadashas = (
  initialStartTimestamp:
    number,

  initialLordIndex:
    number,

  targetTimestamp:
    number
): FullMahadasha[] => {
  const periods:
    FullMahadasha[] = [];

  let cursor =
    initialStartTimestamp;

  let iteration =
    0;

  /*
   * More than enough for even a birth
   * chart older than the normal 120-year
   * display horizon.
   */
  const safetyLimit =
    40;

  while (
    cursor <=
      targetTimestamp &&
    iteration <
      safetyLimit
  ) {
    const definition =
      VIMSHOTTARI_SEQUENCE[
        (
          initialLordIndex +
          iteration
        ) %
          VIMSHOTTARI_SEQUENCE
            .length
      ];

    if (
      !definition
    ) {
      break;
    }

    const durationMs =
      yearsToMilliseconds(
        definition.years
      );

    const endTimestamp =
      cursor +
      durationMs;

    periods.push({
      id:
        `${definition.lord.toLowerCase()}-${Math.round(
          cursor
        )}`,

      lord:
        definition.lord,

      startTimestamp:
        cursor,

      endTimestamp,

      fullDurationYears:
        definition.years,
    });

    cursor =
      endTimestamp;

    iteration +=
      1;
  }

  return periods;
};

/* =========================================================
   FULL ANTARDASHA GENERATOR
========================================================= */

const generateFullAntardashas = (
  mahadasha:
    FullMahadasha
): FullAntardasha[] => {
  const periods:
    FullAntardasha[] = [];

  const mahadashaIndex =
    findDefinitionIndex(
      mahadasha.lord
    );

  let cursor =
    mahadasha.startTimestamp;

  for (
    let iteration = 0;
    iteration < 9;
    iteration += 1
  ) {
    const definition =
      VIMSHOTTARI_SEQUENCE[
        (
          mahadashaIndex +
          iteration
        ) %
          VIMSHOTTARI_SEQUENCE
            .length
      ];

    if (
      !definition
    ) {
      continue;
    }

    const durationYears =
      (
        mahadasha
          .fullDurationYears *
        definition.years
      ) /
      VIMSHOTTARI_CYCLE_YEARS;

    let endTimestamp =
      cursor +
      yearsToMilliseconds(
        durationYears
      );

    /*
     * Force the final Antardasha to end
     * exactly at the Mahadasha boundary.
     * This prevents microscopic floating
     * point drift.
     */
    if (
      iteration ===
      8
    ) {
      endTimestamp =
        mahadasha.endTimestamp;
    }

    periods.push({
      id:
        `${mahadasha.id}-${definition.lord.toLowerCase()}`,

      mahadashaLord:
        mahadasha.lord,

      lord:
        definition.lord,

      startTimestamp:
        cursor,

      endTimestamp,

      fullDurationYears:
        durationYears,
    });

    cursor =
      endTimestamp;
  }

  return periods;
};

/* =========================================================
   ANTARDASHA PUBLIC OBJECT
========================================================= */

const makeAntardashaPeriod = (
  period:
    FullAntardasha,

  visibleStart:
    number,

  visibleEnd:
    number,

  birthTimestamp:
    number,

  currentTimestamp:
    number
): AntardashaPeriod => {
  const start =
    Math.max(
      period.startTimestamp,
      visibleStart
    );

  const end =
    Math.min(
      period.endTimestamp,
      visibleEnd
    );

  return {
    id:
      period.id,

    mahadashaLord:
      period.mahadashaLord,

    lord:
      period.lord,

    startDate:
      toIso(start),

    endDate:
      toIso(end),

    fullStartDate:
      toIso(
        period.startTimestamp
      ),

    fullEndDate:
      toIso(
        period.endTimestamp
      ),

    durationYears:
      millisecondsToYears(
        Math.max(
          0,
          end - start
        )
      ),

    fullDurationYears:
      period.fullDurationYears,

    containsBirth:
      birthTimestamp >=
        period.startTimestamp &&
      birthTimestamp <
        period.endTimestamp,

    isCurrent:
      currentTimestamp >=
        period.startTimestamp &&
      currentTimestamp <
        period.endTimestamp,

    isPartialAtBirth:
      start >
      period.startTimestamp,

    isPartialAtHorizon:
      end <
      period.endTimestamp,
  };
};

/* =========================================================
   MAHADASHA PUBLIC OBJECT
========================================================= */

const makeMahadashaPeriod = (
  period:
    FullMahadasha,

  visibleStart:
    number,

  visibleEnd:
    number,

  birthTimestamp:
    number,

  currentTimestamp:
    number
): MahadashaPeriod => {
  const start =
    Math.max(
      period.startTimestamp,
      visibleStart
    );

  const end =
    Math.min(
      period.endTimestamp,
      visibleEnd
    );

  const antardashas =
    generateFullAntardashas(
      period
    )
      .filter(
        (
          antardasha
        ) =>
          antardasha
            .endTimestamp >
            start &&
          antardasha
            .startTimestamp <
            end
      )
      .map(
        (
          antardasha
        ) =>
          makeAntardashaPeriod(
            antardasha,
            start,
            end,
            birthTimestamp,
            currentTimestamp
          )
      );

  return {
    id:
      period.id,

    lord:
      period.lord,

    startDate:
      toIso(start),

    endDate:
      toIso(end),

    fullStartDate:
      toIso(
        period.startTimestamp
      ),

    fullEndDate:
      toIso(
        period.endTimestamp
      ),

    durationYears:
      millisecondsToYears(
        Math.max(
          0,
          end - start
        )
      ),

    fullDurationYears:
      period.fullDurationYears,

    containsBirth:
      birthTimestamp >=
        period.startTimestamp &&
      birthTimestamp <
        period.endTimestamp,

    isCurrent:
      currentTimestamp >=
        period.startTimestamp &&
      currentTimestamp <
        period.endTimestamp,

    isPartialAtBirth:
      start >
      period.startTimestamp,

    isPartialAtHorizon:
      end <
      period.endTimestamp,

    antardashas,
  };
};

/* =========================================================
   FULL-PERIOD PUBLIC VERSION
========================================================= */

const makeFullMahadashaPeriod = (
  period:
    FullMahadasha,

  birthTimestamp:
    number,

  currentTimestamp:
    number
): MahadashaPeriod => {
  return makeMahadashaPeriod(
    period,
    period.startTimestamp,
    period.endTimestamp,
    birthTimestamp,
    currentTimestamp
  );
};

/* =========================================================
   MAIN CALCULATION
========================================================= */

export const calculateVimshottariDasha = (
  birthChart:
    BirthChartResult,

  currentDate:
    Date = new Date()
): VimshottariResult => {
  const moon =
    birthChart.planets.find(
      (
        planet
      ) =>
        planet.name ===
        "Moon"
    );

  if (
    !moon
  ) {
    throw new VimshottariCalculationError(
      "The D1 chart does not contain a Moon position."
    );
  }

  const birthDate =
    new Date(
      birthChart
        .calculation
        .utcDateTime
    );

  if (
    Number.isNaN(
      birthDate.getTime()
    )
  ) {
    throw new VimshottariCalculationError(
      "The birth UTC timestamp is invalid."
    );
  }

  const birthTimestamp =
    birthDate.getTime();

  const currentTimestamp =
    currentDate.getTime();

  const moonLongitude =
    normalizeDegrees(
      moon.longitude
    );

  /* =======================================================
     JANMA NAKSHATRA
  ======================================================= */

  const nakshatraIndex =
    Math.min(
      26,

      Math.floor(
        moonLongitude /
        NAKSHATRA_SPAN
      )
    );

  const nakshatraStart =
    nakshatraIndex *
    NAKSHATRA_SPAN;

  const degreeInsideNakshatra =
    moonLongitude -
    nakshatraStart;

  const progress =
    clamp(
      degreeInsideNakshatra /
        NAKSHATRA_SPAN,
      0,
      1
    );

  const remainingFraction =
    1 -
    progress;

  /*
   * Ashwini begins with Ketu, Bharani
   * with Venus, etc. The nine-lord
   * sequence repeats three times
   * across the 27 nakshatras.
   */
  const birthLordIndex =
    nakshatraIndex %
    VIMSHOTTARI_SEQUENCE
      .length;

  const birthDefinition =
    VIMSHOTTARI_SEQUENCE[
      birthLordIndex
    ];

  if (
    !birthDefinition
  ) {
    throw new VimshottariCalculationError(
      "Unable to resolve the starting Mahadasha."
    );
  }

  /* =======================================================
     BALANCE AT BIRTH
  ======================================================= */

  const elapsedYears =
    birthDefinition.years *
    progress;

  const remainingYears =
    birthDefinition.years *
    remainingFraction;

  const birthMahadashaStartTimestamp =
    birthTimestamp -
    yearsToMilliseconds(
      elapsedYears
    );

  const birthMahadashaEndTimestamp =
    birthMahadashaStartTimestamp +
    yearsToMilliseconds(
      birthDefinition.years
    );

  /* =======================================================
     120-YEAR DISPLAY WINDOW
  ======================================================= */

  const timelineEndTimestamp =
    birthTimestamp +
    yearsToMilliseconds(
      VIMSHOTTARI_CYCLE_YEARS
    );

  /*
   * We may need to calculate beyond 120
   * years solely to identify the current
   * period for an exceptionally old chart.
   */
  const coverageTarget =
    Math.max(
      timelineEndTimestamp,
      currentTimestamp
    );

  const fullMahadashas =
    generateFullMahadashas(
      birthMahadashaStartTimestamp,
      birthLordIndex,
      coverageTarget
    );

  /* =======================================================
     BIRTH ANTARDASHA
  ======================================================= */

  const birthFullMahadasha =
    fullMahadashas.find(
      (
        period
      ) =>
        birthTimestamp >=
          period.startTimestamp &&
        birthTimestamp <
          period.endTimestamp
    );

  let birthAntardasha:
    AntardashaPeriod |
    null = null;

  if (
    birthFullMahadasha
  ) {
    const fullAntardasha =
      generateFullAntardashas(
        birthFullMahadasha
      ).find(
        (
          period
        ) =>
          birthTimestamp >=
            period.startTimestamp &&
          birthTimestamp <
            period.endTimestamp
      );

    if (
      fullAntardasha
    ) {
      birthAntardasha =
        makeAntardashaPeriod(
          fullAntardasha,
          fullAntardasha
            .startTimestamp,
          fullAntardasha
            .endTimestamp,
          birthTimestamp,
          currentTimestamp
        );
    }
  }

  /* =======================================================
     CURRENT MAHADASHA / ANTARDASHA
  ======================================================= */

  const currentFullMahadasha =
    fullMahadashas.find(
      (
        period
      ) =>
        currentTimestamp >=
          period.startTimestamp &&
        currentTimestamp <
          period.endTimestamp
    );

  let currentMahadasha:
    MahadashaPeriod |
    null = null;

  let currentAntardasha:
    AntardashaPeriod |
    null = null;

  if (
    currentFullMahadasha
  ) {
    currentMahadasha =
      makeFullMahadashaPeriod(
        currentFullMahadasha,
        birthTimestamp,
        currentTimestamp
      );

    const fullAntardasha =
      generateFullAntardashas(
        currentFullMahadasha
      ).find(
        (
          period
        ) =>
          currentTimestamp >=
            period.startTimestamp &&
          currentTimestamp <
            period.endTimestamp
      );

    if (
      fullAntardasha
    ) {
      currentAntardasha =
        makeAntardashaPeriod(
          fullAntardasha,
          fullAntardasha
            .startTimestamp,
          fullAntardasha
            .endTimestamp,
          birthTimestamp,
          currentTimestamp
        );
    }
  }

  /* =======================================================
     DISPLAY TIMELINE
  ======================================================= */

  const visibleMahadashas =
    fullMahadashas
      .filter(
        (
          period
        ) =>
          period.endTimestamp >
            birthTimestamp &&
          period.startTimestamp <
            timelineEndTimestamp
      )
      .map(
        (
          period
        ) =>
          makeMahadashaPeriod(
            period,
            birthTimestamp,
            timelineEndTimestamp,
            birthTimestamp,
            currentTimestamp
          )
      );

  return {
    system:
      "Vimshottari",

    convention:
      "365.25-day dasha year",

    cycleYears:
      120,

    generatedAt:
      new Date()
        .toISOString(),

    currentDateTime:
      currentDate
        .toISOString(),

    birthDateTime:
      birthDate
        .toISOString(),

    moonLongitude,

    moonNakshatraIndex:
      nakshatraIndex,

    moonNakshatra:
      nakshatras[
        nakshatraIndex
      ] ??
      moon.nakshatra,

    moonNakshatraProgress:
      progress,

    moonNakshatraRemaining:
      remainingFraction,

    birthMahadashaLord:
      birthDefinition.lord,

    birthMahadashaFullStart:
      toIso(
        birthMahadashaStartTimestamp
      ),

    birthMahadashaEnd:
      toIso(
        birthMahadashaEndTimestamp
      ),

    birthBalanceYears:
      remainingYears,

    birthBalancePercent:
      remainingFraction *
      100,

    birthAntardasha,

    currentMahadasha,

    currentAntardasha,

    timelineEnd:
      toIso(
        timelineEndTimestamp
      ),

    mahadashas:
      visibleMahadashas,

    notes: [
      "The starting Mahadasha is determined from the Moon's sidereal birth nakshatra.",
      "The first Mahadasha balance is proportional to the untraversed portion of that nakshatra at birth.",
      "Each Antardasha duration equals Mahadasha years multiplied by Antardasha-lord years and divided by 120.",
      "This calculator uses a fixed Vimshottari year of 365.25 days.",
      "The displayed timeline covers 120 Vimshottari years from the moment of birth.",
    ],
  };
};