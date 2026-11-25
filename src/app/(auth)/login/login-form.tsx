"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { loginSchema } from "@/lib/validations/auth";
import { markCartMergedInSession } from "@/features/cart/lib/cart-merge";
import { toast } from "sonner";

interface LoginFormProps {
  callbackUrl: string;
  isRegistered?: boolean;
}

export function LoginForm({ callbackUrl, isRegistered = false }: LoginFormProps) {
  const router = useRouter();

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    if (globalError) setGlobalError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGlobalError(null);
    setFieldErrors({});

    // 1. Client-side Zod validation
    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        if (fieldName && !errors[fieldName]) {
          errors[fieldName] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Auth.js Credentials signIn call
      const res = await signIn("credentials", {
        email: validation.data.email,
        password: validation.data.password,
        redirect: false,
      });

      if (res?.error) {
        // Generic message defends against account enumeration
        const genericError =
          "Invalid email or password. Please verify your credentials and try again.";
        setGlobalError(genericError);
        toast.error("Sign In Failed", {
          description: genericError,
        });
        setIsSubmitting(false);
        return;
      }

      toast.success("Welcome Back", {
        description: "You have signed in to your RoboHatch account.",
      });

      // 3. Mark cart merged in session to prevent duplicate merge operations
      markCartMergedInSession();

      // 4. Navigate to safe callback URL and refresh server state
      router.push(callbackUrl);
      router.refresh();
    } catch {
      const fallbackMsg =
        "An unexpected error occurred during sign in. Please try again.";
      setGlobalError(fallbackMsg);
      toast.error("Error", { description: fallbackMsg });
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md border-border/80 shadow-sm">
      <CardHeader className="space-y-1.5 text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E87536]/10 text-[#E87536]">
          <span className="font-mono text-sm font-bold">RH</span>
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground sm:text-sm">
          Sign in to your RoboHatch customer account
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-4">
          {/* Success banner if arriving after registration */}
          {isRegistered && !globalError && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-800 dark:text-emerald-400"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Registration complete! Please sign in with your password.</span>
            </div>
          )}

          {/* Global error alert */}
          {globalError && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive"
            >
              {globalError}
            </div>
          )}

          {/* Email Address */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold text-foreground sm:text-sm"
            >
              Email Address
            </label>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              error={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
              className="h-10 text-sm"
            />
            {fieldErrors.email && (
              <p id="login-email-error" className="text-xs text-destructive">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-foreground sm:text-sm"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                error={!!fieldErrors.password}
                aria-describedby={
                  fieldErrors.password ? "login-password-error" : undefined
                }
                className="h-10 pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p id="login-password-error" className="text-xs text-destructive">
                {fieldErrors.password}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="shadow-xs h-10 w-full gap-2 rounded-lg bg-[#171717] font-semibold text-white transition-all hover:bg-[#262626] active:scale-[0.99] disabled:opacity-60 dark:bg-white dark:text-[#171717]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-foreground underline-offset-4 transition-colors hover:text-[#E87536] hover:underline"
            >
              Create Account
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
