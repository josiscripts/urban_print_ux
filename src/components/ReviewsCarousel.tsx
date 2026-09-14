import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type Review = {
  id: string;
  author: string;
  rating: number;
  content: string;
};

function ReviewCard({ review, active }: { review: Review; active: boolean }) {
  return (
    <div
      className={`flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-all duration-500 ease-in-out ${
        active
          ? "z-10 scale-110 opacity-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] lg:-translate-y-3"
          : "scale-95 opacity-60 shadow-sm"
      }`}
    >
      <p className="text-primary" aria-label={`${review.rating} de 5`}>
        {"★".repeat(review.rating)}
        <span className="text-muted-foreground">{"★".repeat(5 - review.rating)}</span>
      </p>
      <p className="mt-3 flex-1 text-sm text-muted-foreground italic">“{review.content}”</p>
      <footer className="mt-4 font-display text-sm tracking-wide uppercase">{review.author}</footer>
    </div>
  );
}

export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const total = reviews.length;
  const [index, setIndex] = useState(total);
  const [paused, setPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);

  const extended = [...reviews, ...reviews, ...reviews];

  const next = useCallback(() => {
    if (total < 2) return;
    setIndex((i) => i + 1);
  }, [total]);

  const prev = useCallback(() => {
    if (total < 2) return;
    setIndex((i) => i - 1);
  }, [total]);

  useEffect(() => {
    if (paused || total < 2) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [paused, next, total]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const handleTransitionEnd = () => {
      if (index >= total * 2) {
        setIsTransitioning(false);
        setIndex(total);
      } else if (index < total) {
        setIsTransitioning(false);
        setIndex(total * 2 - 1);
      }
    };

    el.addEventListener("transitionend", handleTransitionEnd);
    return () => el.removeEventListener("transitionend", handleTransitionEnd);
  }, [index, total]);

  useEffect(() => {
    if (!isTransitioning) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsTransitioning(true));
      });
    }
  }, [isTransitioning]);

  if (total === 0) return null;

  const mobileTranslate = -index * 100;
  const desktopTranslate = -(index - 1) * (100 / 3);

  return (
    <div
      className="relative mt-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style>{`
        .reviews-track {
          transform: translateX(${mobileTranslate}%);
          transition: transform 500ms ease-in-out;
        }
        @media (min-width: 768px) {
          .reviews-track {
            transform: translateX(${desktopTranslate}%);
          }
        }
      `}</style>

      <div className="overflow-hidden md:px-14">
        <div
          ref={trackRef}
          className="reviews-track flex"
          style={{ transitionDuration: isTransitioning ? "500ms" : "0ms" }}
        >
          {extended.map((review, i) => {
            const isActive = i === index;
            return (
              <div key={`${review.id}-${i}`} className="w-full flex-shrink-0 px-3 md:w-1/3">
                <ReviewCard review={review} active={isActive} />
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={prev}
        aria-label="Opinión anterior"
        className="absolute top-1/2 left-0 z-20 flex size-10 -translate-y-1/2 items-center justify-center bg-ink text-ink-foreground transition-colors hover:bg-primary"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Siguiente opinión"
        className="absolute top-1/2 right-0 z-20 flex size-10 -translate-y-1/2 items-center justify-center bg-ink text-ink-foreground transition-colors hover:bg-primary"
      >
        <ChevronRight className="size-5" />
      </button>

    </div>
  );
}
