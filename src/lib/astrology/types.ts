export type ZodiacMode =
  | "sidereal"
  | "tropical";

export type Ayanamsha =
  | "lahiri";

export type NodeType =
  | "mean"
  | "true";

export type ChartStyle =
  | "north-indian"
  | "south-indian";

export type HouseSystem =
  | "whole-sign"
  | "equal"
  | "placidus";

export type ChartStatus =
  | "demo"
  | "calculated";

export type PlanetName =
  | "Sun"
  | "Moon"
  | "Mars"
  | "Mercury"
  | "Jupiter"
  | "Venus"
  | "Saturn"
  | "Rahu"
  | "Ketu";

export interface BirthChartInput {
  name?: string;

  birthDate: string;
  birthTime: string;
  birthPlace: string;
  timezone: string;

  latitude: number;
  longitude: number;
}

export interface ChartSettings {
  zodiac: ZodiacMode;
  ayanamsha: Ayanamsha;
  nodeType: NodeType;
  chartStyle: ChartStyle;
  houseSystem: HouseSystem;
}

export interface CelestialPosition {
  longitude: number;

  signNumber: number;
  signName: string;

  degreeInSign: number;
  formattedDegree: string;

  house: number;

  nakshatra: string;
  pada: number;
}

export interface AscendantPosition
  extends CelestialPosition {
  name: "Ascendant";
  abbreviation: "ASC";
}

export interface PlanetPosition
  extends CelestialPosition {
  name: PlanetName;
  abbreviation: string;
  retrograde: boolean;
}

export interface CalculationMetadata {
  engine: "astronomy-engine";
  engineVersion: "2.1.19";

  model:
    "Astronomy Engine + Lahiri approximation";

  utcDateTime: string;
  ayanamshaDegrees: number;

  ayanamshaMethod:
    "Lahiri IAU-1976 anchored approximation";
}

export interface BirthChartResult {
  id: string;
  status: ChartStatus;
  generatedAt: string;

  input: BirthChartInput;
  settings: ChartSettings;
  calculation: CalculationMetadata;

  ascendant: AscendantPosition;
  planets: PlanetPosition[];

  warnings: string[];
}