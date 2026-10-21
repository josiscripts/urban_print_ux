import { createFileRoute } from "@tanstack/react-router";

interface GoogleReviewsResponse {
  success: boolean;
  data?: {
    displayName: string;
    rating: number;
    reviewCount: number;
    googleMapsUri?: string;
    reviews: Array<{
      reviewer: {
        displayName: string;
        profilePhotoUri?: string;
      };
      rating: number;
      text: string;
      publishTime: string;
    }>;
  };
  error?: string;
}

async function getGoogleReviews(): Promise<GoogleReviewsResponse> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  // Validar variables de entorno
  if (!apiKey || apiKey === "MI_API_KEY") {
    return {
      success: false,
      error: "Google Places API key not configured",
    };
  }

  if (!placeId || placeId === "MI_PLACE_ID") {
    return {
      success: false,
      error: "Google Place ID not configured",
    };
  }

  try {
    // Consultar Google Places API (New)
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?key=${apiKey}`,
      {
        method: "GET",
        headers: {
          "X-Goog-FieldMask": "*",
        },
      },
    );

    if (!response.ok) {
      let error: unknown;
      try {
        error = await response.json();
      } catch {
        error = { status: response.status, statusText: response.statusText };
      }
      console.error("Google Places API error:", response.status, error);

      if (response.status === 401) {
        return {
          success: false,
          error: "Invalid API key",
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: "Place not found",
        };
      }

      if (response.status === 400) {
        return {
          success: false,
          error: "Invalid request to Google Places API",
        };
      }

      return {
        success: false,
        error: "Failed to fetch reviews from Google Places",
      };
    }

    const data = await response.json();

    // Transformar la respuesta de Google al formato esperado
    return {
      success: true,
      data: {
        displayName: data.displayName || "Business",
        rating: data.rating || 0,
        reviewCount: data.userRatingCount || 0,
        googleMapsUri: data.googleMapsUri,
        reviews: (data.reviews || []).map((review: any) => ({
          author: {
            displayName: review.author?.displayName || "Anonymous",
            profilePhotoUri: review.author?.profilePhotoUri,
          },
          rating: review.rating || 0,
          text: review.text || "",
          publishTime: review.publishTime || new Date().toISOString(),
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching Google reviews:", error);
    return {
      success: false,
      error: "Failed to fetch reviews",
    };
  }
}

export const Route = createFileRoute("/api/google-reviews")({
  server: {
    handlers: {
      GET: async () => {
        const result = await getGoogleReviews();
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 400,
          headers: {
            "Content-Type": "application/json",
          },
        });
      },
    },
  },
});
