import { createServerFn } from "@tanstack/react-start";
import { publicSupabase } from "./supabase-public.server";

export type Producto = {
  id: string;
  slug: string;
  name: string;
  price: number;
  description: string | null;
  featured: boolean;
  category_id: string;
};

export type Categoria = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  position: number;
};

export const getCatalogo = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicSupabase();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, name, description, parent_id, position")
      .order("position"),
    supabase
      .from("products")
      .select("id, slug, name, price, description, featured, category_id")
      .order("position"),
  ]);
  return {
    categories: (categories ?? []) as Categoria[],
    products: (products ?? []) as Producto[],
  };
});

async function getGoogleFiveStarReviews() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  console.log("[REVIEWS] Fetching reviews for placeId:", placeId);

  if (!apiKey || apiKey === "MI_API_KEY" || !placeId || placeId === "MI_PLACE_ID") {
    console.log("[REVIEWS] Missing credentials");
    return [];
  }

  try {
    // Usar Web Service API (antiguo) que SÍ devuelve reviews
    // El endpoint v1/places NO devuelve reviews, por eso usamos el antiguo nearbySearch/details
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&fields=reviews,rating`;

    console.log("[REVIEWS] Requesting URL:", url.substring(0, 100) + "...");
    const response = await fetch(url);

    console.log("[REVIEWS] Response status:", response.status);

    if (!response.ok) {
      console.log("[REVIEWS] Request failed");
      return [];
    }

    const data = await response.json();
    console.log("[REVIEWS] Response data:", JSON.stringify(data).substring(0, 500));

    if (data.status !== "OK" || !data.result?.reviews || data.result.reviews.length === 0) {
      return [];
    }

    // Filtrar SOLO reseñas con exactamente 5 estrellas
    const fiveStarReviews = data.result.reviews.filter((review: any) => review.rating === 5);

    // Transformar al formato esperado por ReviewsCarousel
    return fiveStarReviews.map((review: any, index: number) => ({
      id: `google-${index}`,
      author: review.author_name || "Anonymous",
      rating: review.rating,
      content: review.text || "",
    }));
  } catch (error) {
    console.error("Error fetching Google reviews:", error);
    return [];
  }
}

export const getReviews = createServerFn({ method: "GET" }).handler(async () => {
  try {
    // Obtener reseñas de 5 estrellas de Google Places API
    // Sin fallback a Supabase - solo reseñas reales de Google
    const googleReviews = await getGoogleFiveStarReviews();
    return googleReviews;
  } catch (error) {
    console.error("Error fetching reviews from Google:", error);
    // No fallback to Supabase - if Google fails, no reviews shown
    return [];
  }
});
