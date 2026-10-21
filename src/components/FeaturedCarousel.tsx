import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import type { Producto } from "@/lib/catalog.functions";

/**
 * Carrusel de productos destacados. Reutiliza ProductCard y muestra
 * 1 / 2 / 3 / 4 tarjetas según el ancho disponible, con arrastre táctil.
 */
export function FeaturedCarousel({ products }: { products: Producto[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!api || paused) return;
    const id = setInterval(() => {
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    }, 3000);
    return () => clearInterval(id);
  }, [api, paused]);

  if (products.length === 0) return null;

  return (
    <Carousel
      setApi={setApi}
      opts={{ align: "start", loop: true }}
      className="mt-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <CarouselContent className="-ml-4">
        {products.map((p, index) => (
          <CarouselItem
            key={p.id}
            className="basis-full pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
          >
            <ProductCard product={p} oferta={index % 2 === 0} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-6 flex justify-center gap-3">
        <CarouselPrevious className="static translate-y-0" />
        <CarouselNext className="static translate-y-0" />
      </div>
    </Carousel>
  );
}
