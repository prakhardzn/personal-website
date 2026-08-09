/* =========================================================
   VEDIC BIRTH CHART
   LOCATION / GEOCODING

   Data source:
   Open-Meteo Geocoding API

   Used by:
   src/components/astrology/BirthChartForm.astro
========================================================= */


/* =========================================================
   API
========================================================= */

const GEOCODING_API_URL =
  "https://geocoding-api.open-meteo.com/v1/search";


const DEFAULT_RESULT_COUNT =
  10;


/* =========================================================
   PUBLIC LOCATION TYPE

   BirthChartForm.astro expects these properties.
========================================================= */

export interface GeocodingLocation {
  id: number;

  name: string;

  latitude: number;

  longitude: number;

  timezone: string;

  country: string;

  countryCode: string;

  admin1: string;

  admin2: string;

  admin3: string;

  admin4: string;

  elevation: number | null;

  population: number | null;
}


/* =========================================================
   RAW OPEN-METEO RESPONSE
========================================================= */

interface OpenMeteoGeocodingResult {
  id?: number;

  name?: string;

  latitude?: number;

  longitude?: number;

  elevation?: number;

  feature_code?: string;

  country_code?: string;

  admin1_id?: number;

  admin2_id?: number;

  admin3_id?: number;

  admin4_id?: number;

  timezone?: string;

  population?: number;

  country_id?: number;

  country?: string;

  admin1?: string;

  admin2?: string;

  admin3?: string;

  admin4?: string;

  postcodes?: string[];
}


interface OpenMeteoGeocodingResponse {
  results?:
    OpenMeteoGeocodingResult[];

  generationtime_ms?: number;
}


/* =========================================================
   ERROR TYPE
========================================================= */

export class GeocodingError extends Error {
  code: string;

  status?: number;


  constructor(
    message: string,
    code = "GEOCODING_ERROR",
    status?: number
  ) {
    super(message);

    this.name =
      "GeocodingError";

    this.code =
      code;

    this.status =
      status;

    Object.setPrototypeOf(
      this,
      GeocodingError.prototype
    );
  }
}


/* =========================================================
   HELPERS
========================================================= */

const cleanText = (
  value:
    string |
    null |
    undefined
): string => {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }


  return value
    .replace(
      /\s+/g,
      " "
    )
    .trim();
};


const isFiniteNumber = (
  value: unknown
): value is number => {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value
    )
  );
};


const normaliseSearchQuery = (
  query: string
): string => {
  return cleanText(
    query
  );
};


/* =========================================================
   RESULT VALIDATION
========================================================= */

const isUsableResult = (
  result:
    OpenMeteoGeocodingResult
): boolean => {
  return (
    Boolean(
      cleanText(
        result.name
      )
    ) &&
    isFiniteNumber(
      result.latitude
    ) &&
    isFiniteNumber(
      result.longitude
    )
  );
};


/* =========================================================
   CONVERT OPEN-METEO RESULT
========================================================= */

const normaliseLocation = (
  result:
    OpenMeteoGeocodingResult,

  index: number
): GeocodingLocation | null => {
  if (
    !isUsableResult(
      result
    )
  ) {
    return null;
  }


  const latitude =
    result.latitude as number;


  const longitude =
    result.longitude as number;


  /*
   * Open-Meteo normally provides a numerical ID.
   *
   * The fallback only exists so the autocomplete
   * still has a usable DOM identifier if an entry
   * happens to arrive without one.
   */

  const fallbackId =
    Math.abs(
      Math.round(
        (
          latitude *
            1_000_000
        ) +
        (
          longitude *
            100_000
        ) +
        index
      )
    );


  return {
    id:
      isFiniteNumber(
        result.id
      )
        ? result.id
        : fallbackId,

    name:
      cleanText(
        result.name
      ),

    latitude,

    longitude,

    timezone:
      cleanText(
        result.timezone
      ),

    country:
      cleanText(
        result.country
      ),

    countryCode:
      cleanText(
        result.country_code
      ).toUpperCase(),

    admin1:
      cleanText(
        result.admin1
      ),

    admin2:
      cleanText(
        result.admin2
      ),

    admin3:
      cleanText(
        result.admin3
      ),

    admin4:
      cleanText(
        result.admin4
      ),

    elevation:
      isFiniteNumber(
        result.elevation
      )
        ? result.elevation
        : null,

    population:
      isFiniteNumber(
        result.population
      )
        ? result.population
        : null,
  };
};


/* =========================================================
   REMOVE DUPLICATE RESULTS
========================================================= */

const removeDuplicateLocations = (
  locations:
    GeocodingLocation[]
): GeocodingLocation[] => {
  const seen =
    new Set<string>();


  return locations.filter(
    (
      location
    ) => {
      const key =
        [
          location.name
            .toLowerCase(),

          location.admin1
            .toLowerCase(),

          location.country
            .toLowerCase(),

          location.latitude
            .toFixed(4),

          location.longitude
            .toFixed(4),
        ].join(
          "|"
        );


      if (
        seen.has(
          key
        )
      ) {
        return false;
      }


      seen.add(
        key
      );


      return true;
    }
  );
};


/* =========================================================
   LOCATION LABEL

   Example:

   Mumbai, Maharashtra, India
========================================================= */

export const formatLocationLabel = (
  location:
    GeocodingLocation
): string => {
  const parts = [
    location.name,
    location.admin1,
    location.country,
  ]
    .map(
      cleanText
    )
    .filter(
      Boolean
    );


  /*
   * Prevent labels such as:
   *
   * Singapore, Singapore, Singapore
   */

  const uniqueParts =
    parts.filter(
      (
        part,
        index
      ) => {
        const normalised =
          part.toLowerCase();


        return (
          parts.findIndex(
            (
              otherPart
            ) =>
              otherPart
                .toLowerCase() ===
              normalised
          ) ===
          index
        );
      }
    );


  return uniqueParts.join(
    ", "
  );
};


/* =========================================================
   SEARCH CACHE

   Prevents repeating the same API request when the
   user focuses the input or types the same query again.
========================================================= */

const searchCache =
  new Map<
    string,
    GeocodingLocation[]
  >();


const MAX_CACHE_ENTRIES =
  50;


const saveToCache = (
  query: string,
  results:
    GeocodingLocation[]
): void => {
  if (
    searchCache.size >=
    MAX_CACHE_ENTRIES
  ) {
    const oldestKey =
      searchCache
        .keys()
        .next()
        .value;


    if (
      oldestKey
    ) {
      searchCache.delete(
        oldestKey
      );
    }
  }


  searchCache.set(
    query,
    results
  );
};


/* =========================================================
   SEARCH BIRTHPLACES
========================================================= */

export const searchBirthplaces =
  async (
    query: string,
    signal?: AbortSignal
  ): Promise<
    GeocodingLocation[]
  > => {
    const cleanedQuery =
      normaliseSearchQuery(
        query
      );


    /*
     * BirthChartForm already waits for
     * three characters.
     *
     * We repeat the check here so this
     * function remains safe if reused.
     */

    if (
      cleanedQuery.length <
      3
    ) {
      return [];
    }


    const cacheKey =
      cleanedQuery
        .toLocaleLowerCase(
          "en"
        );


    const cached =
      searchCache.get(
        cacheKey
      );


    if (
      cached
    ) {
      return [
        ...cached,
      ];
    }


    /* =====================================================
       BUILD REQUEST
    ===================================================== */

    const parameters =
      new URLSearchParams({
        name:
          cleanedQuery,

        count:
          String(
            DEFAULT_RESULT_COUNT
          ),

        language:
          "en",

        format:
          "json",
      });


    const requestUrl =
      `${GEOCODING_API_URL}?${parameters.toString()}`;


    let response:
      Response;


    /* =====================================================
       NETWORK REQUEST
    ===================================================== */

    try {
      response =
        await fetch(
          requestUrl,
          {
            method:
              "GET",

            headers: {
              Accept:
                "application/json",
            },

            signal,

            cache:
              "no-store",
          }
        );
    } catch (
      error
    ) {
      /*
       * AbortController is used by
       * BirthChartForm when the user
       * types another character.
       *
       * Abort errors must remain abort
       * errors so the form can ignore
       * them correctly.
       */

      if (
        error instanceof
          DOMException &&
        error.name ===
          "AbortError"
      ) {
        throw error;
      }


      throw new GeocodingError(
        "Could not connect to the location database. Check your internet connection and try again.",
        "NETWORK_ERROR"
      );
    }


    /* =====================================================
       HTTP ERROR
    ===================================================== */

    if (
      !response.ok
    ) {
      if (
        response.status ===
        429
      ) {
        throw new GeocodingError(
          "The location service is receiving too many requests. Wait a moment and try again.",
          "RATE_LIMITED",
          response.status
        );
      }


      if (
        response.status >=
        500
      ) {
        throw new GeocodingError(
          "The location database is temporarily unavailable. Try again shortly.",
          "SERVICE_UNAVAILABLE",
          response.status
        );
      }


      throw new GeocodingError(
        `Location search failed with status ${response.status}.`,
        "HTTP_ERROR",
        response.status
      );
    }


    /* =====================================================
       READ JSON
    ===================================================== */

    let data:
      OpenMeteoGeocodingResponse;


    try {
      data =
        (
          await response.json()
        ) as
          OpenMeteoGeocodingResponse;
    } catch {
      throw new GeocodingError(
        "The location database returned an unreadable response.",
        "INVALID_RESPONSE"
      );
    }


    /* =====================================================
       NO RESULTS
    ===================================================== */

    if (
      !Array.isArray(
        data.results
      ) ||
      data.results.length ===
        0
    ) {
      saveToCache(
        cacheKey,
        []
      );


      return [];
    }


    /* =====================================================
       NORMALISE
    ===================================================== */

    const locations =
      data.results
        .map(
          (
            result,
            index
          ) =>
            normaliseLocation(
              result,
              index
            )
        )
        .filter(
          (
            location
          ): location is
            GeocodingLocation =>
            location !==
            null
        );


    const uniqueLocations =
      removeDuplicateLocations(
        locations
      );


    /*
     * A timezone is required for an
     * accurate birth chart.
     *
     * Open-Meteo normally provides it.
     * Results without one are kept at
     * the bottom rather than being
     * completely discarded.
     */

    uniqueLocations.sort(
      (
        first,
        second
      ) => {
        const firstHasTimezone =
          Boolean(
            first.timezone
          );


        const secondHasTimezone =
          Boolean(
            second.timezone
          );


        if (
          firstHasTimezone ===
          secondHasTimezone
        ) {
          return 0;
        }


        return firstHasTimezone
          ? -1
          : 1;
      }
    );


    saveToCache(
      cacheKey,
      uniqueLocations
    );


    return [
      ...uniqueLocations,
    ];
  };