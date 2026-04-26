"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { CheckCircle } from "lucide-react";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="card shadow-xl text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1B1A44] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
            Email sent!
          </h1>
          <p className="text-gray-500 mb-6 text-sm">
            Check your inbox for a password reset link. It expires in 1 hour.
          </p>
          <Link href="/login" className="btn-secondary inline-block text-sm">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="card shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#1B1A44] mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
            Reset your password
          </h1>
          <p className="text-sm text-gray-500">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}

          <Button type="submit" fullWidth loading={isSubmitting}>
            Send Reset Link
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Remember your password?{" "}
          <Link href="/login" className="text-primary-600 font-medium hover:text-primary-700">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
