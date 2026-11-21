import { MainContainer } from "@/components/layout";
import { PageHeader } from "@/components/common";
import { Badge } from "@/components/ui/badge";

export default function CategoriesPage() {
  return (
    <MainContainer size="xl" className="py-12">
      <PageHeader
        badge="Hierarchy"
        title="Product Categories"
        description="Browse products organized by functional domains and design collections."
        actions={<Badge variant="brand-subtle">Phase 3: Catalog Feature</Badge>}
      />
      <div className="mt-8 rounded-lg border border-dashed border-border bg-card/50 p-12 text-center text-sm text-muted-foreground">
        Category collections and taxonomy hierarchy will be implemented in Phase 3.
      </div>
    </MainContainer>
  );
}
