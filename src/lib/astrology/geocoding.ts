export interface GeocodingLocation {
  id: number;

  name: string;

  latitude: number;
  longitude: number;

  timezone: string;

  country?: string;
  countryCode?: string;

  admin1?: string;
  admin2?: string;

  population?: number;
}

interface OpenMeteoLocation {
  id?: number;

  name?: string;

  latitude?: number;
  longitude?: number;

  timezone?: string;

  country?: string;
  country_code?: string;

  admin1?: string;
  admin2?: string;

  population?: number;
}

interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoLocation[];

  error?: boolean;

  reason?: string;
}

export class GeocodingError
  extends Error {
  constructor(
    message: string
  ) {
    super(message);

    this.name =
      "GeocodingError";
  }
}

const isFiniteCoordinate = (
  value: unknown
): value is number => {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(value)
  );
};

export const formatLocationLabel = (
  location:
    GeocodingLocation
): string => {
  const parts = [
    location.name,
    location.admin1,
    location.country,
  ];

  const uniqueParts =
    parts.filter(
      (
        value,
        index,
        values
      ): value is string => {
        if (!value) {
          return false;
        }

        return (
          values.indexOf(
            value
          ) === index
        );
      }
    );

  return uniqueParts.join(
    ", "
  );
};

export const searchBirthplaces =
  async (
    query: string,
    signal?: AbortSignal
  ): Promise<
    GeocodingLocation[]
  > => {
    const cleanedQuery =
      query.trim();

    if (
      cleanedQuery.length <
      3
    ) {
      return [];
    }

    const url =
      new URL(
        "https://geocoding-api.open-meteo.com/v1/search"
      );

    url.searchParams.set(
      "name",
      cleanedQuery
    );

    url.searchParams.set(
      "count",
      "8"
    );

    url.searchParams.set(
      "language",
      "en"
    );

    url.searchParams.set(
      "format",
      "json"
    );

    let response:
      Response;

    try {
      response =
        await fetch(
          url,
          {
            method:
              "GET",

            headers: {
              Accept:
                "application/json",
            },

            signal,
          }
        );
    } catch (
      error
    ) {
      if (
        error instanceof
          DOMException &&
        error.name ===
          "AbortError"
      ) {
        throw error;
      }

      throw new GeocodingError(
        "The location service could not be reached."
      );
    }

    let data:
      OpenMeteoGeocodingResponse;

    try {
      data =
        await response.json();
    } catch {
      throw new GeocodingError(
        "The location service returned an invalid response."
      );
    }

    if (
      !response.ok ||
      data.error
    ) {
      throw new GeocodingError(
        data.reason ||
          "The location search failed."
      );
    }

    if (
      !Array.isArray(
        data.results
      )
    ) {
      return [];
    }

    return data.results
      .filter(
        (
          result
        ): result is
          OpenMeteoLocation &
          {
            id: number;
            name: string;
            latitude: number;
            longitude: number;
            timezone: string;
          } => {
          return (
            typeof result.id ===
              "number" &&

            typeof result.name ===
              "string" &&

            isFiniteCoordinate(
              result.latitude
            ) &&

            isFiniteCoordinate(
              result.longitude
            ) &&

            typeof result.timezone ===
              "string"
          );
        }
      )
      .map(
        (
          result
        ): GeocodingLocation => {
          return {
            id:
              result.id,

            name:
              result.name,

            latitude:
              result.latitude,

            longitude:
              result.longitude,

            timezone:
              result.timezone,

            country:
              result.country,

            countryCode:
              result.country_code,

            admin1:
              result.admin1,

            admin2:
              result.admin2,

            population:
              result.population,
          };
        }
      );
  };