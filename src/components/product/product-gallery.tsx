"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ProductGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

export function ProductGallery({ images, productName, className }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Safe bounds check
  const activeImage =
    images[currentIndex] || images[0] || "/images/products/voronoi-kinetic-vessel.jpg";
  const hasMultiple = images.length > 1;

  const handleSelectIndex = React.useCallback(
    (index: number) => {
      if (index === currentIndex) return;
      setIsTransitioning(true);
      setCurrentIndex(index);
      const timer = setTimeout(() => setIsTransitioning(false), 250);
      return () => clearTimeout(timer);
    },
    [currentIndex]
  );

  const handlePrev = React.useCallback(() => {
    handleSelectIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  }, [currentIndex, images.length, handleSelectIndex]);

  const handleNext = React.useCallback(() => {
    handleSelectIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, images.length, handleSelectIndex]);

  // Keyboard navigation with input focus guard
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasMultiple) return;
      const activeEl = document.activeElement;
      if (
        activeEl?.tagName === "INPUT" ||
        activeEl?.tagName === "TEXTAREA" ||
        activeEl?.tagName === "SELECT" ||
        (activeEl as HTMLElement)?.isContentEditable
      ) {
        return;
      }
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasMultiple, handlePrev, handleNext]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Main Image Viewport Frame */}
      <div className="shadow-xs group relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-[#F1F1EF] dark:bg-secondary/40">
        <div
          className={cn(
            "relative h-full w-full transition-opacity duration-300 ease-out",
            isTransitioning ? "scale-[0.99] opacity-40" : "scale-100 opacity-100"
          )}
        >
          <Image
            src={activeImage}
            alt={`${productName} – View ${currentIndex + 1} of ${images.length}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          />
        </div>

        {/* Lightbox / Zoom Trigger Button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setLightboxOpen(true)}
          className="shadow-xs absolute right-3 top-3 h-11 min-h-[44px] w-11 min-w-[44px] rounded-lg border-border/80 bg-background/85 text-foreground backdrop-blur-md transition-all hover:scale-105 hover:bg-background active:scale-95"
          aria-label="Enlarge product image in lightbox"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>

        {/* Previous / Next Arrow Controls (visible when multiple images) */}
        {hasMultiple && (
          <div className="pointer-events-none absolute inset-x-3 top-1/2 flex -translate-y-1/2 items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="pointer-events-auto h-11 min-h-[44px] w-11 min-w-[44px] rounded-full border-border/80 bg-background/85 text-foreground shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-background active:scale-95"
              aria-label="Previous product perspective"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="pointer-events-auto h-11 min-h-[44px] w-11 min-w-[44px] rounded-full border-border/80 bg-background/85 text-foreground shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-background active:scale-95"
              aria-label="Next product perspective"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {hasMultiple && (
        <div
          role="tablist"
          aria-label="Product perspective thumbnails"
          className="flex items-center gap-3 overflow-x-auto pb-1 pt-0.5"
        >
          {images.map((img, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Select product view ${idx + 1} of ${images.length}`}
                onClick={() => handleSelectIndex(idx)}
                className={cn(
                  "relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-[#F1F1EF] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87536] focus-visible:ring-offset-2 sm:h-20 sm:w-20",
                  isActive
                    ? "shadow-xs border-[#E87536] ring-2 ring-[#E87536]/30 dark:bg-secondary/40"
                    : "border-border/70 opacity-70 hover:scale-[1.02] hover:border-foreground/30 hover:opacity-100 active:scale-[0.98]"
                )}
              >
                <Image
                  src={img}
                  alt={`${productName} – Thumbnail perspective ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl border-border bg-background/95 p-3 backdrop-blur-xl sm:p-6">
          <DialogHeader className="flex flex-row items-center justify-between pb-2">
            <DialogTitle className="text-base font-semibold text-foreground sm:text-lg">
              {productName}
            </DialogTitle>
            <div className="flex items-center gap-2 pr-6">
              <span className="rounded-md border border-border bg-secondary/40 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
          </DialogHeader>

          {/* Large Lightbox Image Viewport */}
          <div className="relative aspect-square max-h-[75vh] w-full overflow-hidden rounded-lg border border-border/60 bg-[#F1F1EF] dark:bg-secondary/20">
            <Image
              src={activeImage}
              alt={`${productName} – High-resolution enlarged view ${currentIndex + 1} of ${images.length}`}
              fill
              className="object-contain"
            />
          </div>

          {/* Lightbox Controls */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Use arrow keys or buttons to navigate
            </span>
            {hasMultiple && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  className="h-9 min-h-[36px] gap-1 px-3 text-xs"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  className="h-9 min-h-[36px] gap-1 px-3 text-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
