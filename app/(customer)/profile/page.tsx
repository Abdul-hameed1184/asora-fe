"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Shield, Edit2, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/lib/stores/useAuthStore";

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

const QUICK_LINKS = [
  { label: "My Orders", href: "/orders" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Track Order", href: "/track-order" },
];

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phoneNumber: user?.phoneNumber ?? "",
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 text-center px-4">
        <h2 className="font-garamound text-2xl text-foreground">
          Please sign in to view your profile
        </h2>
        <p className="text-foreground/50 text-sm">
          You need to be authenticated to access your account.
        </p>
        <Link
          href="/login"
          className="bg-primary text-white font-courier text-[10px] tracking-[0.2em] uppercase px-8 py-4 hover:bg-primary/90 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  const handleSave = () => {
    // Wire to update-profile API endpoint when available
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setEditing(false);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
    });
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const updateField = (key: keyof ProfileForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const FIELDS: { label: string; key: keyof ProfileForm; type: string }[] = [
    { label: "First Name", key: "firstName", type: "text" },
    { label: "Last Name", key: "lastName", type: "text" },
    { label: "Email Address", key: "email", type: "email" },
    { label: "Phone Number", key: "phoneNumber", type: "tel" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12 border-b border-border pb-8">
          <p className="font-courier text-[10px] tracking-[0.2em] uppercase text-foreground/40 mb-3">
            Account
          </p>
          <h1 className="font-garamound text-4xl font-semibold text-foreground">
            My Profile
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left — Avatar card + nav */}
          <div className="lg:col-span-1 space-y-4">
            {/* Avatar + name */}
            <div className="border border-border p-8 text-center">
              <div className="w-20 h-20 bg-primary/10 border-2 border-primary/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="font-garamound text-2xl font-semibold text-primary">
                  {initials}
                </span>
              </div>
              <h2 className="font-garamound text-xl font-semibold text-foreground mb-1">
                {user.firstName} {user.lastName}
              </h2>
              <p className="font-courier text-[9px] tracking-[0.1em] text-foreground/40 mb-3">
                {user.email}
              </p>
              <span className="font-courier text-[8px] tracking-[0.2em] uppercase bg-primary/10 text-primary px-3 py-1 inline-block">
                {user.role}
              </span>
            </div>

            {/* Navigation */}
            <nav className="border border-border divide-y divide-border">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition-colors group"
                >
                  <span className="font-courier text-[10px] tracking-[0.15em] uppercase text-foreground/55 group-hover:text-primary transition-colors">
                    {link.label}
                  </span>
                  <span className="text-foreground/20 group-hover:text-primary transition-colors text-sm">
                    →
                  </span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-alert/5 transition-colors group text-left"
              >
                <span className="font-courier text-[10px] tracking-[0.15em] uppercase text-alert/60 group-hover:text-alert transition-colors">
                  Sign Out
                </span>
                <span className="text-alert/20 group-hover:text-alert transition-colors text-sm">
                  →
                </span>
              </button>
            </nav>
          </div>

          {/* Right — Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="border border-border p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-foreground/30" />
                  <h3 className="font-courier text-[10px] tracking-[0.2em] uppercase text-foreground/55">
                    Personal Information
                  </h3>
                </div>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 font-courier text-[9px] tracking-[0.15em] uppercase text-primary hover:text-primary/70 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>

              {/* Success banner */}
              {saved && (
                <div className="flex items-center gap-2 mb-6 p-3 bg-success/5 border border-success/20">
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                  <p className="font-courier text-[9px] text-success tracking-wider">
                    Profile updated successfully
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {FIELDS.map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="font-courier text-[9px] tracking-[0.2em] uppercase text-foreground/40 block mb-2">
                      {label}
                    </label>
                    {editing ? (
                      <input
                        type={type}
                        value={form[key]}
                        onChange={updateField(key)}
                        className="w-full border-b border-border bg-transparent font-courier text-sm pb-2 focus:outline-none focus:border-primary transition-colors"
                      />
                    ) : (
                      <p className="font-courier text-sm text-foreground border-b border-transparent pb-2">
                        {form[key] || (
                          <span className="text-foreground/25 italic">Not set</span>
                        )}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {editing && (
                <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-border">
                  <button
                    onClick={handleSave}
                    className="bg-primary text-white font-courier text-[9px] tracking-[0.2em] uppercase px-8 py-3 hover:bg-primary/90 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="border border-border text-foreground/60 font-courier text-[9px] tracking-[0.2em] uppercase px-8 py-3 hover:border-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Security */}
            <div className="border border-border p-8">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-4 h-4 text-foreground/30" />
                <h3 className="font-courier text-[10px] tracking-[0.2em] uppercase text-foreground/55">
                  Security
                </h3>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="font-garamound text-base text-foreground mb-1">
                    Password
                  </p>
                  <p className="font-courier text-[9px] text-foreground/40">
                    Keep your account protected with a strong password
                  </p>
                </div>
                <button className="font-courier text-[9px] tracking-[0.15em] uppercase text-primary border-b border-primary pb-0.5 hover:text-primary/70 hover:border-primary/70 transition-colors">
                  Change Password
                </button>
              </div>
            </div>

            {/* Preferences */}
            <div className="border border-border p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-3 h-3 border border-foreground/30" />
                </div>
                <h3 className="font-courier text-[10px] tracking-[0.2em] uppercase text-foreground/55">
                  Notifications
                </h3>
              </div>
              <div className="space-y-5">
                {[
                  { label: "Order updates", desc: "Get notified when your order status changes" },
                  { label: "New arrivals", desc: "Be the first to know about new collections" },
                  { label: "Exclusive offers", desc: "Receive personalised atelier promotions" },
                ].map((pref) => (
                  <label
                    key={pref.label}
                    className="flex items-start justify-between gap-4 cursor-pointer group"
                  >
                    <div>
                      <p className="font-courier text-[10px] tracking-[0.1em] uppercase text-foreground/70 group-hover:text-foreground transition-colors">
                        {pref.label}
                      </p>
                      <p className="text-foreground/40 text-xs mt-0.5 leading-relaxed">
                        {pref.desc}
                      </p>
                    </div>
                    <div className="flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
