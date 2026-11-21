import { MainContainer } from "@/components/layout";
import { PageHeader } from "@/components/common";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  return (
    <MainContainer size="xl" className="py-12">
      <PageHeader
        badge="Studio"
        title="About RoboHatch"
        description="Transforming mathematical geometry into tangible physical artifacts through high-precision additive manufacturing."
        actions={<Badge variant="brand-subtle">Design Studio</Badge>}
      />
      <div className="mt-8 max-w-2xl space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          RoboHatch combines aerospace-grade polymers and high-resolution resin technology
          to craft bespoke physical artifacts for creators, architects, and design
          enthusiasts.
        </p>
      </div>
    </MainContainer>
  );
}
