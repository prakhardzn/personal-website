import type {
  BirthChartInput,
  PlanetName,
} from "./types";

export type ReferenceBodyName =
  | "Ascendant"
  | PlanetName;

export interface AccuracyReferenceBody {
  name: ReferenceBodyName;

  longitude: number;

  signNumber: number;
  signName: string;

  house: number;

  nakshatra: string;
  pada: number;

  retrograde?: boolean;
}

export interface AccuracyFixture {
  id: string;

  label: string;

  description: string;

  input: BirthChartInput;

  expectedUtc: string;

  expectedAyanamsha: number;

  referenceBodies:
    AccuracyReferenceBody[];
}

/*
 * =========================================================
 * REFERENCE SOURCE
 * =========================================================
 *
 * These fixture values use:
 *
 * - Swiss Ephemeris
 * - Sidereal zodiac
 * - Lahiri ayanamsha
 * - Mean lunar node
 * - Geocentric planetary positions
 * - Whole-sign house assignment
 *
 * They are intentionally stored separately from
 * calculations.ts so the engine cannot accidentally
 * "test itself".
 *
 * DO NOT regenerate these values using our own
 * calculateBirthChart() function.
 */

/* =========================================================
   FIXTURE 01
   MUMBAI
========================================================= */

const mumbaiFixture:
  AccuracyFixture = {
  id:
    "mumbai-2003-11-01",

  label:
    "Mumbai // 01 Nov 2003",

  description:
    "Primary India reference case. Tests Asia/Kolkata conversion, Lahiri ayanamsha, Aquarius Ascendant and all nine graha positions.",

  input: {
    name:
      "Audit Mumbai",

    birthDate:
      "2003-11-01",

    birthTime:
      "15:15",

    birthPlace:
      "Mumbai, Maharashtra, India",

    timezone:
      "Asia/Kolkata",

    latitude:
      19.076,

    longitude:
      72.8777,
  },

  expectedUtc:
    "2003-11-01T09:45:00.000Z",

  expectedAyanamsha:
    23.91063181008309,

  referenceBodies: [
    {
      name:
        "Ascendant",

      longitude:
        322.5582508827076,

      signNumber:
        11,

      signName:
        "Aquarius",

      house:
        1,

      nakshatra:
        "Purva Bhadrapada",

      pada:
        1,
    },

    {
      name:
        "Sun",

      longitude:
        194.64597199688095,

      signNumber:
        7,

      signName:
        "Libra",

      house:
        9,

      nakshatra:
        "Swati",

      pada:
        3,

      retrograde:
        false,
    },

    {
      name:
        "Moon",

      longitude:
        287.4107254750059,

      signNumber:
        10,

      signName:
        "Capricorn",

      house:
        12,

      nakshatra:
        "Shravana",

      pada:
        3,

      retrograde:
        false,
    },

    {
      name:
        "Mars",

      longitude:
        313.55583036429357,

      signNumber:
        11,

      signName:
        "Aquarius",

      house:
        1,

      nakshatra:
        "Shatabhisha",

      pada:
        3,

      retrograde:
        false,
    },

    {
      name:
        "Mercury",

      longitude:
        199.0580088616781,

      signNumber:
        7,

      signName:
        "Libra",

      house:
        9,

      nakshatra:
        "Swati",

      pada:
        4,

      retrograde:
        false,
    },

    {
      name:
        "Jupiter",

      longitude:
        139.24036175569094,

      signNumber:
        5,

      signName:
        "Leo",

      house:
        7,

      nakshatra:
        "Purva Phalguni",

      pada:
        2,

      retrograde:
        false,
    },

    {
      name:
        "Venus",

      longitude:
        214.23028442027348,

      signNumber:
        8,

      signName:
        "Scorpio",

      house:
        10,

      nakshatra:
        "Anuradha",

      pada:
        1,

      retrograde:
        false,
    },

    {
      name:
        "Saturn",

      longitude:
        79.29482691473869,

      signNumber:
        3,

      signName:
        "Gemini",

      house:
        5,

      nakshatra:
        "Ardra",

      pada:
        4,

      retrograde:
        true,
    },

    {
      name:
        "Rahu",

      longitude:
        27.003578247812275,

      signNumber:
        1,

      signName:
        "Aries",

      house:
        3,

      nakshatra:
        "Krittika",

      pada:
        1,

      retrograde:
        true,
    },

    {
      name:
        "Ketu",

      longitude:
        207.00357824781227,

      signNumber:
        7,

      signName:
        "Libra",

      house:
        9,

      nakshatra:
        "Vishakha",

      pada:
        3,

      retrograde:
        true,
    },
  ],
};

/* =========================================================
   FIXTURE 02
   LONDON

   This deliberately uses a summer date.
   Europe/London is using daylight-saving time.
========================================================= */

const londonFixture:
  AccuracyFixture = {
  id:
    "london-1990-06-15",

  label:
    "London // 15 Jun 1990",

  description:
    "Daylight-saving reference case. Local 12:30 in London must resolve to 11:30 UTC.",

  input: {
    name:
      "Audit London",

    birthDate:
      "1990-06-15",

    birthTime:
      "12:30",

    birthPlace:
      "London, England, United Kingdom",

    timezone:
      "Europe/London",

    latitude:
      51.5072,

    longitude:
      -0.1276,
  },

  expectedUtc:
    "1990-06-15T11:30:00.000Z",

  expectedAyanamsha:
    23.72373505832644,

  referenceBodies: [
    {
      name:
        "Ascendant",

      longitude:
        146.30664731132003,

      signNumber:
        5,

      signName:
        "Leo",

      house:
        1,

      nakshatra:
        "Purva Phalguni",

      pada:
        4,
    },

    {
      name:
        "Sun",

      longitude:
        60.38237174092815,

      signNumber:
        3,

      signName:
        "Gemini",

      house:
        11,

      nakshatra:
        "Mrigashira",

      pada:
        3,

      retrograde:
        false,
    },

    {
      name:
        "Moon",

      longitude:
        321.35235044485466,

      signNumber:
        11,

      signName:
        "Aquarius",

      house:
        7,

      nakshatra:
        "Purva Bhadrapada",

      pada:
        1,

      retrograde:
        false,
    },

    {
      name:
        "Mars",

      longitude:
        347.2990374054583,

      signNumber:
        12,

      signName:
        "Pisces",

      house:
        8,

      nakshatra:
        "Revati",

      pada:
        1,

      retrograde:
        false,
    },

    {
      name:
        "Mercury",

      longitude:
        41.927670482565695,

      signNumber:
        2,

      signName:
        "Taurus",

      house:
        10,

      nakshatra:
        "Rohini",

      pada:
        1,

      retrograde:
        false,
    },

    {
      name:
        "Jupiter",

      longitude:
        82.15762697650482,

      signNumber:
        3,

      signName:
        "Gemini",

      house:
        11,

      nakshatra:
        "Punarvasu",

      pada:
        1,

      retrograde:
        false,
    },

    {
      name:
        "Venus",

      longitude:
        25.025815584142762,

      signNumber:
        1,

      signName:
        "Aries",

      house:
        9,

      nakshatra:
        "Bharani",

      pada:
        4,

      retrograde:
        false,
    },

    {
      name:
        "Saturn",

      longitude:
        270.3058867458707,

      signNumber:
        10,

      signName:
        "Capricorn",

      house:
        6,

      nakshatra:
        "Uttara Ashadha",

      pada:
        2,

      retrograde:
        true,
    },

    {
      name:
        "Rahu",

      longitude:
        285.9716902638255,

      signNumber:
        10,

      signName:
        "Capricorn",

      house:
        6,

      nakshatra:
        "Shravana",

      pada:
        2,

      retrograde:
        true,
    },

    {
      name:
        "Ketu",

      longitude:
        105.97169026382551,

      signNumber:
        4,

      signName:
        "Cancer",

      house:
        12,

      nakshatra:
        "Pushya",

      pada:
        4,

      retrograde:
        true,
    },
  ],
};

/* =========================================================
   FIXTURE 03
   NEW YORK
========================================================= */

const newYorkFixture:
  AccuracyFixture = {
  id:
    "new-york-1985-02-20",

  label:
    "New York // 20 Feb 1985",

  description:
    "Western-longitude and winter-time reference case. Local 07:45 must resolve to 12:45 UTC.",

  input: {
    name:
      "Audit New York",

    birthDate:
      "1985-02-20",

    birthTime:
      "07:45",

    birthPlace:
      "New York, New York, United States",

    timezone:
      "America/New_York",

    latitude:
      40.7128,

    longitude:
      -74.006,
  },

  expectedUtc:
    "1985-02-20T12:45:00.000Z",

  expectedAyanamsha:
    23.64950805518083,

  referenceBodies: [
    {
      name:
        "Ascendant",

      longitude:
        332.2502480244356,

      signNumber:
        12,

      signName:
        "Pisces",

      house:
        1,

      nakshatra:
        "Purva Bhadrapada",

      pada:
        4,
    },

    {
      name:
        "Sun",

      longitude:
        308.18711930250527,

      signNumber:
        11,

      signName:
        "Aquarius",

      house:
        12,

      nakshatra:
        "Shatabhisha",

      pada:
        1,

      retrograde:
        false,
    },

    {
      name:
        "Moon",

      longitude:
        316.68958254037375,

      signNumber:
        11,

      signName:
        "Aquarius",

      house:
        12,

      nakshatra:
        "Shatabhisha",

      pada:
        4,

      retrograde:
        false,
    },

    {
      name:
        "Mars",

      longitude:
        349.6794239128876,

      signNumber:
        12,

      signName:
        "Pisces",

      house:
        1,

      nakshatra:
        "Revati",

      pada:
        1,

      retrograde:
        false,
    },

    {
      name:
        "Mercury",

      longitude:
        309.1829678104431,

      signNumber:
        11,

      signName:
        "Aquarius",

      house:
        12,

      nakshatra:
        "Shatabhisha",

      pada:
        1,

      retrograde:
        false,
    },

    {
      name:
        "Jupiter",

      longitude:
        279.47910959700937,

      signNumber:
        10,

      signName:
        "Capricorn",

      house:
        11,

      nakshatra:
        "Uttara Ashadha",

      pada:
        4,

      retrograde:
        false,
    },

    {
      name:
        "Venus",

      longitude:
        350.93517143895997,

      signNumber:
        12,

      signName:
        "Pisces",

      house:
        1,

      nakshatra:
        "Revati",

      pada:
        2,

      retrograde:
        false,
    },

    {
      name:
        "Saturn",

      longitude:
        214.2882117164205,

      signNumber:
        8,

      signName:
        "Scorpio",

      house:
        9,

      nakshatra:
        "Anuradha",

      pada:
        1,

      retrograde:
        false,
    },

    {
      name:
        "Rahu",

      longitude:
        28.826448273214126,

      signNumber:
        1,

      signName:
        "Aries",

      house:
        2,

      nakshatra:
        "Krittika",

      pada:
        1,

      retrograde:
        true,
    },

    {
      name:
        "Ketu",

      longitude:
        208.8264482732141,

      signNumber:
        7,

      signName:
        "Libra",

      house:
        8,

      nakshatra:
        "Vishakha",

      pada:
        3,

      retrograde:
        true,
    },
  ],
};

/* =========================================================
   EXPORT
========================================================= */

export const accuracyFixtures:
  AccuracyFixture[] = [
  mumbaiFixture,
  londonFixture,
  newYorkFixture,
];