import type { APIRoute } from "astro";

export const prerender = false;

interface OMDbSearchItem {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

interface OMDbResponse {
  Search?: OMDbSearchItem[];
  totalResults?: string;
  Response?: "True" | "False";
  Error?: string;
}

export const GET: APIRoute = async ({ request }) => {
  const requestUrl = new URL(request.url);

  const query =
    requestUrl.searchParams
      .get("q")
      ?.trim() ?? "";

  if (query.length < 2) {
    return Response.json(
      {
        success: false,
        message:
          "Enter at least two characters.",
        results: [],
      },
      {
        status: 400,
      }
    );
  }

  const apiKey =
    import.meta.env.OMDB_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        success: false,
        message:
          "Astro cannot find OMDB_API_KEY in .env.",
        results: [],
      },
      {
        status: 500,
      }
    );
  }

  const omdbUrl =
    new URL(
      "https://www.omdbapi.com/"
    );

  omdbUrl.searchParams.set(
    "apikey",
    apiKey
  );

  omdbUrl.searchParams.set(
    "s",
    query
  );

  omdbUrl.searchParams.set(
    "type",
    "movie"
  );

  omdbUrl.searchParams.set(
    "r",
    "json"
  );

  try {
    const response =
      await fetch(
        omdbUrl.toString()
      );

    let data: OMDbResponse;

    try {
      data =
        (await response.json()) as OMDbResponse;
    } catch {
      return Response.json(
        {
          success: false,
          message:
            `OMDb returned HTTP ${response.status}, but the response was not JSON.`,
          results: [],
        },
        {
          status: 502,
        }
      );
    }

    /*
     * IMPORTANT:
     * Return OMDb's real error instead of
     * hiding everything behind
     * "Could not contact OMDb".
     */
    if (!response.ok) {
      return Response.json(
        {
          success: false,
          message:
            data.Error ??
            `OMDb returned HTTP ${response.status}.`,
          omdbStatus:
            response.status,
          results: [],
        },
        {
          status: 502,
        }
      );
    }

    if (
      data.Response === "False"
    ) {
      return Response.json({
        success: false,
        message:
          data.Error ??
          "OMDb rejected the request.",
        results: [],
      });
    }

    const results =
      (data.Search ?? []).map(
        (movie) => ({
          title:
            movie.Title,

          year:
            movie.Year,

          imdbId:
            movie.imdbID,

          type:
            movie.Type,

          poster:
            movie.Poster &&
            movie.Poster !== "N/A"
              ? movie.Poster
              : null,
        })
      );

    return Response.json({
      success: true,

      totalResults:
        Number(
          data.totalResults ?? 0
        ),

      results,
    });
  } catch (error) {
    console.error(
      "OMDb network error:",
      error
    );

    return Response.json(
      {
        success: false,

        message:
          "Astro could not establish a network connection to OMDb.",

        results: [],
      },
      {
        status: 502,
      }
    );
  }
};