"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignup } from "@/hooks/useSignup";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const { submit, isPending, error } = useSignup();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) return;
    if (!formData.agreeTerms) return;

    submit({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
    });
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        {/* Left Side - Image */}
        <div className="hidden md:flex bg-gray-900 text-white items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <span className="text-4xl font-serif font-bold text-primary">
                ÀṢỌ́RA Clothiers
              </span>
            </div>
            <h2 className="text-3xl font-serif font-bold mb-4 italic">
              Join the Atelier Circle
            </h2>
            <p className="text-gray-400 mb-8">
              Curating the finest heritage fashion
            </p>
            <div className="bg-gray-800 aspect-square rounded-lg flex items-center justify-center mb-8">
              <span className="text-gray-600">Brand Image</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo Mobile */}
            <div className="md:hidden text-center mb-8">
              <span className="text-3xl font-serif font-bold text-primary">
                ÀṢỌ́RA Clothiers
              </span>
            </div>

            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 mb-8">
              Join our community and discover your personal style.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    FIRST NAME
                  </label>
                  <Input
                    type="text"
                    name="firstName"
                    placeholder="Chad"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    LAST NAME
                  </label>
                  <Input
                    type="text"
                    name="lastName"
                    placeholder="Okafor"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  EMAIL ADDRESS
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="chad@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  PHONE NUMBER
                </label>
                <Input
                  type="tel"
                  name="phoneNumber"
                  placeholder="+234 800 000 0000"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  PASSWORD
                </label>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-gray-600 mt-2">
                  Must be at least 8 characters with uppercase, lowercase, and
                  numbers
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  CONFIRM PASSWORD
                </label>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Terms & Conditions */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300"
                  required
                />
                <span className="text-sm text-gray-700">
                  I agree to the{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {/* Submit Button */}
              <Button
                disabled={isPending}
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 mt-6"
              >

                {isPending ? <Loader2 className="animate-spin" /> : "Create Account"}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Google Button */}
            <Button
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
              <span className="ml-2">Sign up with Google</span>
            </Button>

            {/* Login Link */}
            <p className="text-center text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
