"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PasswordStrength } from "@/components/auth/password-strength";
import { updateProfileAction, changePasswordAction } from "@/lib/account/actions";
import { updateProfileSchema, changePasswordSchema } from "@/lib/validations/account";
import { toast } from "sonner";

interface ProfileFormsProps {
  initialUser: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function ProfileForms({ initialUser }: ProfileFormsProps) {
  const router = useRouter();

  // Profile Edit State
  const [name, setName] = React.useState(initialUser.name || "");
  const [profileLoading, setProfileLoading] = React.useState(false);
  const [profileError, setProfileError] = React.useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = React.useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [passwordLoading, setPasswordLoading] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = React.useState(false);

  // Handle Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    const validation = updateProfileSchema.safeParse({ name });
    if (!validation.success) {
      setProfileError(validation.error.issues[0]?.message || "Invalid name input");
      return;
    }

    setProfileLoading(true);
    try {
      const res = await updateProfileAction({ name: validation.data.name });
      if (!res.success) {
        setProfileError(res.error || "Failed to update profile.");
        toast.error("Profile Update Failed", { description: res.error });
      } else {
        setProfileSuccess(true);
        toast.success("Profile Updated", {
          description: "Your display name has been updated.",
        });
        router.refresh();
      }
    } catch {
      setProfileError("An unexpected error occurred. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    const validation = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmNewPassword,
    });

    if (!validation.success) {
      setPasswordError(validation.error.issues[0]?.message || "Invalid password details");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await changePasswordAction(validation.data);
      if (!res.success) {
        setPasswordError(res.error || "Failed to change password.");
        toast.error("Password Update Failed", { description: res.error });
      } else {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        toast.success("Password Changed", {
          description: "Your account password has been updated securely.",
        });
      }
    } catch {
      setPasswordError("An unexpected error occurred. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Identity & Name Editing Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-7">
        <div className="border-b border-border/60 pb-4">
          <h2 className="text-base font-bold text-foreground sm:text-lg">
            Personal Information
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Update your display name and view account contact details.
          </p>
        </div>

        <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
          {profileError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Your profile information has been saved successfully.</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                <User className="h-3.5 w-3.5 text-[#E87536]" />
                <span>Full Name</span>
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (profileError) setProfileError(null);
                  if (profileSuccess) setProfileSuccess(false);
                }}
                placeholder="Your full name"
                className="h-10 border-border bg-background"
                required
                disabled={profileLoading}
              />
            </div>

            {/* Email Address Field (Disabled) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="email"
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  <Mail className="h-3.5 w-3.5 text-[#E87536]" />
                  <span>Email Address</span>
                </label>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Locked
                </span>
              </div>
              <Input
                id="email"
                type="email"
                value={initialUser.email || ""}
                disabled
                className="h-10 cursor-not-allowed border-border/60 bg-secondary/40 text-muted-foreground opacity-80"
              />
              <p className="text-[11px] text-muted-foreground/80">
                Email address modification is locked to maintain verified account
                integrity.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={profileLoading || name === initialUser.name}
              className="h-9 gap-2 bg-[#171717] px-5 text-xs font-semibold text-white dark:bg-white dark:text-[#171717]"
            >
              {profileLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Changes</span>
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Security & Password Change Card */}
      <div
        id="security"
        className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-7"
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-[#E87536]" />
              <h2 className="text-base font-bold text-foreground sm:text-lg">
                Account Security & Password
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Update your account password with cryptographic bcrypt protection.
            </p>
          </div>
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-800 dark:text-emerald-400"
          >
            Bcrypt Protected
          </Badge>
        </div>

        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
          {passwordError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Your password has been updated successfully.</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="currentPassword"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Current Password
              </label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                    if (passwordSuccess) setPasswordSuccess(false);
                  }}
                  placeholder="Enter current password"
                  className="h-10 border-border bg-background pr-10"
                  required
                  disabled={passwordLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="newPassword"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                New Password
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                    if (passwordSuccess) setPasswordSuccess(false);
                  }}
                  placeholder="Enter at least 8 characters with symbols & numbers"
                  className="h-10 border-border bg-background pr-10"
                  required
                  disabled={passwordLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Meter */}
              {newPassword.length > 0 && <PasswordStrength password={newPassword} />}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmNewPassword"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => {
                    setConfirmNewPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                    if (passwordSuccess) setPasswordSuccess(false);
                  }}
                  placeholder="Re-enter your new password"
                  className="h-10 border-border bg-background pr-10"
                  required
                  disabled={passwordLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={
                passwordLoading || !currentPassword || !newPassword || !confirmNewPassword
              }
              className="h-9 gap-2 bg-[#171717] px-5 text-xs font-semibold text-white dark:bg-white dark:text-[#171717]"
            >
              {passwordLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Update Password</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
