"use client";

import * as React from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { MainContainer } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubscribed, setIsSubscribed] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Invalid email address", {
        description: "Please enter a valid email address to join the list.",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      toast.success("Subscribed to RoboHatch dispatch", {
        description:
          "Thank you! You will receive early access to limited batch releases and material updates.",
      });
      setEmail("");
    }, 800);
  };

  return (
    <section className="border-b border-border bg-secondary/40 py-16 sm:py-20 lg:py-24">
      <MainContainer size="md" className="text-center">
        <div className="mx-auto max-w-xl space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Mail className="h-3.5 w-3.5 text-[#E87536]" />
            Studio Dispatch
          </div>

          {/* Headline */}
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Stay Ahead of the Curve.
          </h2>

          {/* Supporting Copy */}
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Receive early notifications for numbered capsule drops, material engineering
            breakthroughs, and behind-the-scenes slicing parameters. No marketing clutter.
          </p>

          {/* Subscription Form */}
          {isSubscribed ? (
            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>You are subscribed to the RoboHatch Studio dispatch.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex max-w-md flex-col gap-2.5 sm:flex-row"
            >
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-background text-sm"
                required
                aria-label="Email address for newsletter"
              />
              <Button
                type="submit"
                variant="brand"
                size="lg"
                isLoading={isSubmitting}
                className="h-11 shrink-0 gap-1.5 font-semibold text-white"
              >
                <span>Subscribe</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          <p className="text-xs text-muted-foreground">
            Zero spam. Unsubscribe at any time with one click.
          </p>
        </div>
      </MainContainer>
    </section>
  );
}
