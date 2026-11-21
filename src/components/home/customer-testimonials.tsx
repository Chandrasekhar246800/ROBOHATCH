import { Star, MessageSquareQuote } from "lucide-react";
import { MainContainer } from "@/components/layout";
import { SectionHeading } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TESTIMONIALS_DATA } from "@/data/testimonials";

export function CustomerTestimonials() {
  return (
    <section className="border-b border-border bg-background py-16 sm:py-20 lg:py-24">
      <MainContainer size="xl" className="space-y-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            badge="Customer Voices"
            title="Design Impressions"
            description="Observations from creators, architects, and industrial designers who integrate RoboHatch artifacts into their physical environments."
          />
          <Badge
            variant="outline"
            className="h-6 shrink-0 self-start text-[10px] text-muted-foreground sm:self-auto"
          >
            Demonstration Reviews
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS_DATA.map((t) => (
            <Card
              key={t.id}
              className="flex flex-col justify-between border-border bg-card p-6 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm"
            >
              <CardContent className="space-y-4 p-0">
                {/* Rating Stars & Quote Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-[#E87536] text-[#E87536]"
                      />
                    ))}
                  </div>
                  <MessageSquareQuote className="h-4 w-4 text-muted-foreground/40" />
                </div>

                {/* Testimonial Quote */}
                <p className="text-sm italic leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Product Reference */}
                <div className="border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
                  Verified Spec:{" "}
                  <span className="font-medium text-foreground">{t.productName}</span>
                </div>
              </CardContent>

              {/* Author Info */}
              <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.author}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.role} • {t.city}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </MainContainer>
    </section>
  );
}
