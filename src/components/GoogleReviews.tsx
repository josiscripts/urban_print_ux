import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Reviewer {
  displayName: string;
  profilePhotoUri?: string;
}

interface GoogleReview {
  reviewer: Reviewer;
  rating: number;
  text: string;
  publishTime: string;
}

interface GoogleReviewsData {
  displayName: string;
  rating: number;
  reviewCount: number;
  googleMapsUri?: string;
  reviews: GoogleReview[];
}

interface GoogleReviewsResponse {
  success: boolean;
  data?: GoogleReviewsData;
  error?: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-primary" aria-label={`${rating} de 5`}>
      {"★".repeat(Math.floor(rating))}
      <span className="text-muted-foreground">{"★".repeat(5 - Math.floor(rating))}</span>
    </span>
  );
}

function ReviewCard({ review }: { review: GoogleReview }) {
  const date = new Date(review.publishTime);
  const formattedDate = date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-5 sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        {review.reviewer.profilePhotoUri && (
          <img
            src={review.reviewer.profilePhotoUri}
            alt={review.reviewer.displayName}
            className="h-10 w-10 rounded-full object-cover flex-shrink-0"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm sm:text-base font-semibold">
            {review.reviewer.displayName}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">{formattedDate}</p>
        </div>
      </div>
      <div className="mt-3">
        <StarRating rating={review.rating} />
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground">{review.text}</p>
    </div>
  );
}

export function GoogleReviews() {
  const [data, setData] = useState<GoogleReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/google-reviews");
        const result: GoogleReviewsResponse = await response.json();

        if (result.success && result.data) {
          setData(result.data);
          setError(null);
        } else {
          setError(result.error || "No se pudieron cargar las reseñas");
          setData(null);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Error al conectar con el servidor");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const reviewCount = data?.reviews.length || 0;

  const next = useCallback(() => {
    if (reviewCount <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % reviewCount);
  }, [reviewCount]);

  const prev = useCallback(() => {
    if (reviewCount <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + reviewCount) % reviewCount);
  }, [reviewCount]);

  // Auto-rotate reviews
  useEffect(() => {
    if (paused || reviewCount < 2 || loading) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [paused, reviewCount, next, loading]);

  // Mostrar nada si está cargando
  if (loading) {
    return (
      <section className="w-full border-y border-border bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 lg:px-20">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 rounded bg-border" />
            <div className="h-4 w-1/4 rounded bg-border" />
          </div>
        </div>
      </section>
    );
  }

  // No mostrar sección si hay error o sin datos
  if (error || !data || reviewCount === 0) {
    return null;
  }

  return (
    <section className="w-full border-y border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 lg:px-20">
        {/* Header */}
        <div className="mb-12">
          <h2 className="font-display text-3xl tracking-tight uppercase">
            Lo que dicen nuestros clientes
          </h2>
          <span className="mt-2 block h-0.5 w-12 bg-primary" />

          {/* Rating Summary */}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-baseline gap-2">
              <StarRating rating={data.rating} />
              <span className="font-display text-lg font-semibold">{data.rating.toFixed(1)}/5</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Basado en {data.reviewCount} {data.reviewCount === 1 ? "reseña" : "reseñas"} de Google
            </p>
          </div>
        </div>

        {/* Reviews Carousel */}
        {reviewCount > 0 && (
          <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="overflow-hidden">
              <div
                ref={trackRef}
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * 100}%)`,
                }}
              >
                {data.reviews.map((review, idx) => (
                  <div key={idx} className="w-full flex-shrink-0 px-2 sm:px-4 md:w-1/2 lg:w-1/3">
                    <ReviewCard review={review} />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            {reviewCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Reseña anterior"
                  className="absolute top-1/2 left-0 z-20 flex size-10 -translate-y-1/2 items-center justify-center bg-ink text-ink-foreground transition-colors hover:bg-primary"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Siguiente reseña"
                  className="absolute top-1/2 right-0 z-20 flex size-10 -translate-y-1/2 items-center justify-center bg-ink text-ink-foreground transition-colors hover:bg-primary"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}

            {/* Indicators */}
            {reviewCount > 1 && (
              <div className="mt-6 flex justify-center gap-1.5">
                {data.reviews.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Ir a reseña ${idx + 1}`}
                    className={`h-2 w-2 rounded-full transition-all ${
                      idx === currentIndex
                        ? "w-6 bg-primary"
                        : "bg-border hover:bg-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Google Attribution */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Reseñas de{" "}
            <a
              href="https://www.google.com/maps/about/"
              target="_blank"
              rel="noreferrer"
              className="inline text-primary hover:underline"
            >
              Google Maps
            </a>
          </p>

          {data.googleMapsUri && (
            <Button asChild variant="outline" size="sm">
              <a href={data.googleMapsUri} target="_blank" rel="noreferrer">
                Ver todas las reseñas en Google
              </a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
