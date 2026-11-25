"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
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
import { registerSchema } from "@/lib/validations/auth";
import { registerUserAction } from "@/lib/auth/actions";
import { PasswordStrength } from "@/components/auth/password-strength";
import { toast } from "sonner";

export function RegisterForm() {
  const router = useRouter();

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-level error on edit
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
    const validation = registerSchema.safeParse(formData);
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
      // 2. Call server-side registration action
      const result = await registerUserAction(validation.data);

      if (!result.success) {
        const errorMessage = result.error || "Unable to complete registration.";
        setGlobalError(errorMessage);
        toast.error("Registration Failed", {
          description: errorMessage,
        });
        setIsSubmitting(false);
        return;
      }

      // 3. Success state & navigation
      toast.success("Account Created Successfully", {
        description: "Welcome to RoboHatch! Please sign in with your credentials.",
      });

      router.push("/login?registered=true");
    } catch {
      const fallbackMsg = "An unexpected error occurred. Please try again.";
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
          Create an Account
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground sm:text-sm">
          Enter your details below to create your RoboHatch account
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-4">
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

          {/* Full Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="register-name"
              className="block text-xs font-semibold text-foreground sm:text-sm"
            >
              Full Name
            </label>
            <Input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="e.g. Alex Mercer"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              error={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              className="h-10 text-sm"
            />
            {fieldErrors.name && (
              <p id="name-error" className="text-xs text-destructive">
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label
              htmlFor="register-email"
              className="block text-xs font-semibold text-foreground sm:text-sm"
            >
              Email Address
            </label>
            <Input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              error={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              className="h-10 text-sm"
            />
            {fieldErrors.email && (
              <p id="email-error" className="text-xs text-destructive">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="register-password"
              className="block text-xs font-semibold text-foreground sm:text-sm"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                error={!!fieldErrors.password}
                aria-describedby={
                  fieldErrors.password ? "password-error" : "password-requirements"
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
              <p id="password-error" className="text-xs text-destructive">
                {fieldErrors.password}
              </p>
            )}

            {/* Interactive Password Strength Feedback */}
            <PasswordStrength password={formData.password} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="register-confirm-password"
              className="block text-xs font-semibold text-foreground sm:text-sm"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="register-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isSubmitting}
                error={!!fieldErrors.confirmPassword}
                aria-describedby={
                  fieldErrors.confirmPassword ? "confirm-error" : undefined
                }
                className="h-10 pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p id="confirm-error" className="text-xs text-destructive">
                {fieldErrors.confirmPassword}
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-foreground underline-offset-4 transition-colors hover:text-[#E87536] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
