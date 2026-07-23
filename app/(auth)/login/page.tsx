"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/useLogin";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { submit, isPending, error } = useLogin();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit({ email, password });
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        {/* Left Side - Brand panel */}
        <div className="hidden md:flex bg-gray-900 text-white items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <span className="text-4xl font-serif font-bold text-primary">
                ÀṢỌ́RA Clothiers
              </span>
            </div>
            <h2 className="text-3xl font-serif font-bold mb-4 italic">
              The art of silk clean breath g.
            </h2>
            <p className="text-gray-400 mb-8">HERITAGE & CRAFT</p>
            <div className="bg-gray-800 aspect-square rounded-lg flex items-center justify-center mb-8">
              <span className="text-gray-600">Brand Image</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo — mobile only */}
            <div className="md:hidden text-center mb-8">
              <span className="text-3xl font-serif font-bold text-primary">
                ÀṢỌ́RA Clothiers
              </span>
            </div>

            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Welcome back
            </h1>
            <p className="text-gray-600 mb-8">
              Access your personalized wardrobe and heritage collections.
            </p>

            {/* Error banner */}
            {error && (
              <div className="mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  EMAIL
                </label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    PASSWORD
                  </label>
                  <Link href="#" className="text-sm text-primary hover:underline">
                    Forgot?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isPending}
              >
                {isPending ? "Signing in…" : "Sign In"}
              </Button>
            </form>

            {/* Divider */}
            {/* <div className="my-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div> */}

            {/* Google */}
            {/* <Button
              size="lg"
              variant="outline"
              className="w-full border-gray-300 text-gray-900 hover:bg-gray-50 mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="ml-2">Continue with Google</span>
            </Button> */}

            <p className="text-center text-gray-600 mt-4">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-primary hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
