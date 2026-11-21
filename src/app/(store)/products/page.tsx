import { MainContainer } from "@/components/layout";
import { PageHeader } from "@/components/common";
import { Badge } from "@/components/ui/badge";

export default function ShopPage() {
  return (
    <MainContainer size="xl" className="py-12">
      <PageHeader
        badge="Catalog"
        title="Shop Products"
        description="Explore precision-crafted 3D-printed products and geometric lifestyle artifacts."
        actions={<Badge variant="brand-subtle">Phase 3: Catalog Feature</Badge>}
      />
      <div className="mt-8 rounded-lg border border-dashed border-border bg-card/50 p-12 text-center text-sm text-muted-foreground">
        Product catalogue and filter pipeline will be implemented in Phase 3.
      </div>
    </MainContainer>
  );
}
