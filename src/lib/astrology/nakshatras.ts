export interface NakshatraPosition {
  name: string;
  index: number;
  pada: number;

  degreeWithinNakshatra: number;
}

export const nakshatras = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
] as const;

const fullCircleDegrees = 360;

const nakshatraSpan =
  fullCircleDegrees /
  nakshatras.length;

const padaSpan =
  nakshatraSpan / 4;

const normalizeDegrees = (
  value: number
): number => {
  return (
    (value % fullCircleDegrees) +
    fullCircleDegrees
  ) % fullCircleDegrees;
};

export const getNakshatraPosition = (
  longitude: number
): NakshatraPosition => {
  const normalizedLongitude =
    normalizeDegrees(longitude);

  const index = Math.min(
    nakshatras.length - 1,

    Math.floor(
      normalizedLongitude /
        nakshatraSpan
    )
  );

  const degreeWithinNakshatra =
    normalizedLongitude -
    index * nakshatraSpan;

  const pada = Math.min(
    4,

    Math.floor(
      degreeWithinNakshatra /
        padaSpan
    ) + 1
  );

  return {
    name: nakshatras[index],
    index,
    pada,
    degreeWithinNakshatra,
  };
};