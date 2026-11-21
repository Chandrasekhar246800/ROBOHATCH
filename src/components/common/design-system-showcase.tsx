"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Sparkles, Box, Info } from "lucide-react";

export function DesignSystemShowcase() {
  const [buttonLoading, setButtonLoading] = React.useState(false);

  const handleSimulateAction = () => {
    setButtonLoading(true);
    setTimeout(() => {
      setButtonLoading(false);
      toast.success("Action completed successfully", {
        description: "RoboHatch design system tokens verified in Sonner toast.",
      });
    }, 1200);
  };

  return (
    <div className="space-y-16">
      {/* 1. Colour Tokens & Brand Spectrum */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            1. Brand Tokens & Semantic Colors
          </h2>
          <p className="text-sm text-muted-foreground">
            Core tokens configured for industrial minimalism, high contrast, and
            accessibility.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          <div className="space-y-1.5 rounded-lg border border-border bg-card p-3">
            <div className="h-10 w-full rounded border border-border bg-[#FAFAF8]" />
            <div className="text-xs font-semibold text-foreground">Primary BG</div>
            <div className="font-mono text-[11px] text-muted-foreground">#FAFAF8</div>
          </div>

          <div className="space-y-1.5 rounded-lg border border-border bg-card p-3">
            <div className="h-10 w-full rounded border border-border bg-[#F1F1EF]" />
            <div className="text-xs font-semibold text-foreground">Secondary BG</div>
            <div className="font-mono text-[11px] text-muted-foreground">#F1F1EF</div>
          </div>

          <div className="space-y-1.5 rounded-lg border border-border bg-card p-3">
            <div className="h-10 w-full rounded bg-[#171717]" />
            <div className="text-xs font-semibold text-foreground">Primary Text</div>
            <div className="font-mono text-[11px] text-muted-foreground">#171717</div>
          </div>

          <div className="space-y-1.5 rounded-lg border border-border bg-card p-3">
            <div className="h-10 w-full rounded bg-[#737373]" />
            <div className="text-xs font-semibold text-foreground">Secondary Text</div>
            <div className="font-mono text-[11px] text-muted-foreground">#737373</div>
          </div>

          <div className="space-y-1.5 rounded-lg border border-border bg-card p-3">
            <div className="h-10 w-full rounded bg-[#E87536]" />
            <div className="text-xs font-semibold text-foreground">Brand Accent</div>
            <div className="font-mono text-[11px] text-muted-foreground">#E87536</div>
          </div>

          <div className="space-y-1.5 rounded-lg border border-border bg-card p-3">
            <div className="h-10 w-full rounded border border-border bg-[#E5E5E5]" />
            <div className="text-xs font-semibold text-foreground">Border</div>
            <div className="font-mono text-[11px] text-muted-foreground">#E5E5E5</div>
          </div>
        </div>

        {/* Semantic States */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Success
            </div>
            <div className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400">
              Confirmed, Paid, Printed
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-amber-600" />
              Warning
            </div>
            <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
              Low Stock, Queue Busy
            </div>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-red-600" />
              Destructive
            </div>
            <div className="mt-1 text-[11px] text-red-700 dark:text-red-400">
              Cancelled, Payment Failed
            </div>
          </div>

          <div className="rounded-lg border border-border bg-secondary p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <span className="h-2 w-2 rounded-full bg-[#E87536]" />
              Accent Focus Ring
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Accessible 2px focus ring
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* 2. Interactive Buttons & States */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            2. Button Hierarchy & Interaction States
          </h2>
          <p className="text-sm text-muted-foreground">
            Support for default, brand, secondary, outline, ghost, link, loading, and
            disabled states.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="brand">Brand Accent</Button>
          <Button variant="default">Primary Dark</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="success">Success</Button>
          <Button
            variant="brand"
            isLoading={buttonLoading}
            onClick={handleSimulateAction}
          >
            {buttonLoading ? "Processing..." : "Trigger Action"}
          </Button>
          <Button variant="outline" disabled>
            Disabled
          </Button>
        </div>
      </section>

      <Separator />

      {/* 3. Badges */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            3. Badges & Status Indicators
          </h2>
          <p className="text-sm text-muted-foreground">
            Clean categorization and fulfillment state pills.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="brand">New Release</Badge>
          <Badge variant="brand-subtle">Precision PETG</Badge>
          <Badge variant="default">Matte Black</Badge>
          <Badge variant="secondary">In Queue</Badge>
          <Badge variant="outline">0.12mm Layer Height</Badge>
          <Badge variant="success">Printing Completed</Badge>
          <Badge variant="success-subtle">Verified Purchase</Badge>
          <Badge variant="warning">Low Stock</Badge>
          <Badge variant="destructive">Sold Out</Badge>
        </div>
      </section>

      <Separator />

      {/* 4. Form Controls */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            4. Form Controls (Input, Textarea, Select)
          </h2>
          <p className="text-sm text-muted-foreground">
            Uniform focus states, subtle borders, and error boundaries.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Standard Input
            </label>
            <Input placeholder="e.g. Spiral Vase v2" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Invalid Input
            </label>
            <Input defaultValue="invalid_sku" error />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Material Selector
            </label>
            <Select defaultValue="petg">
              <SelectTrigger>
                <SelectValue placeholder="Select filament" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="petg">Carbon Fiber PETG</SelectItem>
                <SelectItem value="pla">Industrial Matte PLA</SelectItem>
                <SelectItem value="resin">Ultra-Fine Tough Resin</SelectItem>
                <SelectItem value="tpu">Flexible TPU 95A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="max-w-xl space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Textarea (Custom Specifications)
          </label>
          <Textarea placeholder="Provide any custom infill density or dimensional tolerance requests..." />
        </div>
      </section>

      <Separator />

      {/* 5. Overlays: Dialog, Tooltip, Sonner Toast */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            5. Modals, Tooltips & Toast Notifications
          </h2>
          <p className="text-sm text-muted-foreground">
            Accessible Radix primitives with subtle transitions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Dialog Trigger */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Box className="mr-2 h-4 w-4" />
                Open 3D Print Specs Dialog
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>3D Fabrication Specifications</DialogTitle>
                <DialogDescription>
                  RoboHatch manufactures products on industrial-grade enclosed systems.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-3 text-sm">
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Dimensional Accuracy</span>
                  <span className="font-mono font-medium text-foreground">±0.15 mm</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Standard Infill</span>
                  <span className="font-mono font-medium text-foreground">
                    25% Gyroid
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Surface Finish</span>
                  <span className="font-medium text-foreground">
                    Micro-Textured Matte
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="brand">Confirm Understanding</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="border border-border">
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Aerospace-grade tolerance specification</p>
            </TooltipContent>
          </Tooltip>

          {/* Sonner Toast Trigger */}
          <Button
            variant="secondary"
            onClick={() =>
              toast("Design System Notification", {
                description:
                  "Sonner toaster correctly themed with RoboHatch design tokens.",
              })
            }
          >
            <Sparkles className="mr-2 h-4 w-4 text-[#E87536]" />
            Test Toast
          </Button>
        </div>
      </section>

      <Separator />

      {/* 6. Card & Loading Skeletons */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            6. Card Structure & Loading Skeletons
          </h2>
          <p className="text-sm text-muted-foreground">
            Standard content cards and pulse loading states.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Architectural Artifact Spec</CardTitle>
                <Badge variant="brand-subtle">Ready</Badge>
              </div>
              <CardDescription>
                Card component composition matching minimal design tokens.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Clean 1px borders, subtle hover interaction, and systematic typography
                ensures that products take center stage without visual clutter.
              </p>
            </CardContent>
            <CardFooter className="justify-between border-t border-border/50 pt-4">
              <span className="text-xs text-muted-foreground">Component: Card</span>
              <Button variant="outline" size="sm">
                Inspect Specs
              </Button>
            </CardFooter>
          </Card>

          {/* Skeleton Example */}
          <Card>
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </CardContent>
            <CardFooter className="justify-between border-t border-border/50 pt-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
}
