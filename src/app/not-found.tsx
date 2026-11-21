import Link from "next/link";
import { Navbar, Footer, MainContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex flex-1 items-center justify-center py-20">
        <MainContainer size="sm" className="space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-[#E87536]">
            <Compass className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Page Not Found
            </h1>
            <p className="text-base text-muted-foreground">
              The page you are looking for does not exist or will be implemented in a
              future phase.
            </p>
          </div>
          <div>
            <Button asChild variant="brand">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Home
              </Link>
            </Button>
          </div>
        </MainContainer>
      </main>
      <Footer />
    </div>
  );
}
