"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  Edit2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import { UserService } from "@/services/user.service";
import { SettingsService } from "@/services/settings.service";
import { AuthService } from "@/services/auth.service";
import { QUERY_KEYS } from "@/hooks/queryKeys";
import type { Address, CreateAddressDto, UpdateProfileDto, User as UserProfile } from "@/types/user.type";
import type { UserSettings, UpdateUserSettingsDto } from "@/types/settings.types";
import type { ApiSuccess } from "@/types/api.types";

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

const EMPTY_ADDRESS: CreateAddressDto = {
  address: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  isDefault: false,
};

const ADDRESS_FIELDS: { label: string; key: keyof Omit<CreateAddressDto, "isDefault" | "userId"> }[] = [
  { label: "Address", key: "address" },
  { label: "Street", key: "street" },
  { label: "City", key: "city" },
  { label: "State / Province", key: "state" },
  { label: "ZIP / Postal Code", key: "zipCode" },
  { label: "Country", key: "country" },
];

const QUICK_LINKS = [
  { label: "My Orders", href: "/orders" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Track Order", href: "/track-order" },
];

export default function ProfilePage() {
  const { user, logout, setUser } = useAuthStore();
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const router = useRouter();

  // ── Profile form ────────────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        phoneNumber: user.phoneNumber ?? "",
      });
    }
  }, [user]);

  // ── Address section ─────────────────────────────────────────────────────────
  const [addressForm, setAddressForm] = useState<CreateAddressDto>(EMPTY_ADDRESS);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const { data: addressesData, isLoading: addressesLoading } = useApiQuery<
    ApiSuccess<Address[]>
  >({
    queryKey: QUERY_KEYS.addresses,
    queryFn: () => UserService.getAddresses(),
    enabled: !!user,
  });

  const addresses = addressesData?.data ?? [];

  const { mutate: addAddress, isPending: addingAddress } = useApiMutation<
    unknown,
    CreateAddressDto
  >({
    mutationFn: (data) => UserService.addAddress(data),
    invalidateKeys: [QUERY_KEYS.addresses],
  });

  const { mutate: updateAddress, isPending: updatingAddress } = useApiMutation<
    unknown,
    { id: string; data: Partial<CreateAddressDto> }
  >({
    mutationFn: ({ id, data }) => UserService.updateAddress(id, data),
    invalidateKeys: [QUERY_KEYS.addresses],
  });

  const { mutate: deleteAddress } = useApiMutation<unknown, string>({
    mutationFn: (id) => UserService.deleteAddress(id),
    invalidateKeys: [QUERY_KEYS.addresses],
  });

  const { mutate: updateProfile, isPending: updatingProfile } = useApiMutation<
    ApiSuccess<UserProfile>,
    UpdateProfileDto
  >({
    mutationFn: (data) => UserService.updateProfile(data),
  });

  const { mutate: resendVerification, isPending: resendingVerification } = useApiMutation<
    unknown,
    void
  >({
    mutationFn: () => AuthService.resendVerification(),
  });

  const handleResendVerification = () => {
    resendVerification(undefined, {
      onSuccess: () => toast.success("Verification email sent — please check your inbox."),
    });
  };

  // ── Notification settings ───────────────────────────────────────────────────
  const { data: settingsData } = useApiQuery<ApiSuccess<UserSettings>>({
    queryKey: QUERY_KEYS.settings,
    queryFn: () => SettingsService.getSettings(),
    enabled: !!user,
  });

  const settings = settingsData?.data;

  const { mutate: updateSettings, isPending: updatingSettings } = useApiMutation<
    ApiSuccess<UserSettings>,
    UpdateUserSettingsDto
  >({
    mutationFn: (data) => SettingsService.updateSettings(data),
    invalidateKeys: [QUERY_KEYS.settings],
  });

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
    updateProfile(
      {
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
        profilePicture: "",
        bio: "",
      },
      {
        onSuccess: (data) => {
          if (user) {
            setUser({
              ...user,
              firstName: data.data.firstName,
              lastName: data.data.lastName,
              phoneNumber: data.data.phoneNumber,
            });
          }
          setSaved(true);
          setEditing(false);
          setTimeout(() => setSaved(false), 3000);
        },
      }
    );
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

  const updateAddressField = (key: keyof CreateAddressDto) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setAddressForm((prev) => ({
        ...prev,
        [key]: key === "isDefault" ? (e.target as HTMLInputElement).checked : e.target.value,
      }));

  const openAddForm = () => {
    setAddressForm(EMPTY_ADDRESS);
    setEditingAddressId(null);
    setShowAddressForm(true);
  };

  const openEditForm = (address: Address) => {
    setAddressForm({
      address: address.address ?? "",
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setEditingAddressId(address.id);
    setShowAddressForm(true);
  };

  const closeAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS);
  };

  const handleAddressSave = () => {
    const payload = { ...addressForm, userId: user.id };
    if (editingAddressId) {
      updateAddress(
        { id: editingAddressId, data: payload },
        { onSuccess: closeAddressForm }
      );
    } else {
      addAddress(payload, { onSuccess: closeAddressForm });
    }
  };

  const FIELDS: { label: string; key: keyof ProfileForm; type: string; readOnly?: boolean }[] = [
    { label: "First Name", key: "firstName", type: "text" },
    { label: "Last Name", key: "lastName", type: "text" },
    { label: "Email Address", key: "email", type: "email", readOnly: true },
    { label: "Phone Number", key: "phoneNumber", type: "tel" },
  ];

  const isSavingAddress = addingAddress || updatingAddress;

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

              {saved && (
                <div className="flex items-center gap-2 mb-6 p-3 bg-success/5 border border-success/20">
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                  <p className="font-courier text-[9px] text-success tracking-wider">
                    Profile updated successfully
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {FIELDS.map(({ label, key, type, readOnly }) => (
                  <div key={key}>
                    <label className="font-courier text-[9px] tracking-[0.2em] uppercase text-foreground/40 block mb-2">
                      {label}
                      {readOnly && editing && (
                        <span className="ml-2 text-foreground/25 normal-case not-italic">· cannot be changed</span>
                      )}
                    </label>
                    {editing && !readOnly ? (
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
                    disabled={updatingProfile}
                    className="bg-primary text-white font-courier text-[9px] tracking-[0.2em] uppercase px-8 py-3 hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {updatingProfile ? "Saving…" : "Save Changes"}
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

              {!user.isVerified && (
                <div className="flex items-center justify-between flex-wrap gap-4 mt-6 pt-6 border-t border-border">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-alert flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-garamound text-base text-foreground mb-1">
                        Email not verified
                      </p>
                      <p className="font-courier text-[9px] text-foreground/40">
                        Verify your email to unlock cart and checkout
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleResendVerification}
                    disabled={resendingVerification}
                    className="font-courier text-[9px] tracking-[0.15em] uppercase text-primary border-b border-primary pb-0.5 hover:text-primary/70 hover:border-primary/70 transition-colors disabled:opacity-50"
                  >
                    {resendingVerification ? "Sending…" : "Resend Verification Email"}
                  </button>
                </div>
              )}
            </div>

            {/* Addresses */}
            <div className="border border-border p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-foreground/30" />
                  <h3 className="font-courier text-[10px] tracking-[0.2em] uppercase text-foreground/55">
                    Saved Addresses
                  </h3>
                </div>
                {!showAddressForm && (
                  <button
                    onClick={openAddForm}
                    className="flex items-center gap-1.5 font-courier text-[9px] tracking-[0.15em] uppercase text-primary hover:text-primary/70 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Address
                  </button>
                )}
              </div>

              {/* Address list */}
              {addressesLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 bg-foreground/5 animate-pulse" />
                  ))}
                </div>
              ) : addresses.length === 0 && !showAddressForm ? (
                <div className="text-center py-8">
                  <p className="font-courier text-[10px] tracking-[0.1em] uppercase text-foreground/30 mb-3">
                    No addresses saved
                  </p>
                  <p className="text-foreground/40 text-xs">
                    Add a shipping address to speed up checkout.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="border border-border p-5 flex items-start justify-between gap-4 group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          {address.isDefault && (
                            <span className="font-courier text-[8px] tracking-[0.2em] uppercase bg-primary/10 text-primary px-2 py-0.5">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="font-courier text-sm text-foreground leading-relaxed">
                          {address.street}
                        </p>
                        <p className="font-courier text-[11px] text-foreground/50 mt-0.5">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="font-courier text-[11px] text-foreground/50">
                          {address.country}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => openEditForm(address)}
                          className="p-1.5 text-foreground/30 hover:text-primary transition-colors"
                          aria-label="Edit address"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteAddress(address.id)}
                          className="p-1.5 text-foreground/30 hover:text-alert transition-colors"
                          aria-label="Delete address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add / Edit form */}
              {showAddressForm && (
                <div className="border border-border p-6 mt-4">
                  <p className="font-courier text-[9px] tracking-[0.2em] uppercase text-foreground/40 mb-6">
                    {editingAddressId ? "Edit Address" : "New Address"}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    {ADDRESS_FIELDS.map(({ label, key }) => (
                      <div key={key} className={key === "street" ? "sm:col-span-2" : ""}>
                        <label className="font-courier text-[9px] tracking-[0.2em] uppercase text-foreground/40 block mb-2">
                          {label}
                        </label>
                        <input
                          type="text"
                          value={addressForm[key]}
                          onChange={updateAddressField(key)}
                          className="w-full border-b border-border bg-transparent font-courier text-sm pb-2 focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    ))}
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer mb-6">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={updateAddressField("isDefault")}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                    <span className="font-courier text-[10px] tracking-[0.1em] uppercase text-foreground/60">
                      Set as default address
                    </span>
                  </label>

                  <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                    <button
                      onClick={handleAddressSave}
                      disabled={isSavingAddress}
                      className="bg-primary text-white font-courier text-[9px] tracking-[0.2em] uppercase px-8 py-3 hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isSavingAddress ? "Saving…" : "Save Address"}
                    </button>
                    <button
                      onClick={closeAddressForm}
                      className="border border-border text-foreground/60 font-courier text-[9px] tracking-[0.2em] uppercase px-8 py-3 hover:border-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
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
                {(
                  [
                    { label: "Order updates", desc: "Get notified when your order status changes", field: "orderUpdates" },
                    { label: "New arrivals", desc: "Be the first to know about new collections", field: "newArrivals" },
                    { label: "Exclusive offers", desc: "Receive personalised atelier promotions", field: "promotionalNotifications" },
                  ] as const
                ).map((pref) => (
                  <label
                    key={pref.label}
                    className="flex items-start justify-between gap-4 cursor-pointer group"
                  >
                    <div>
                      <p className="font-courier text-sm tracking-[0.05em] uppercase text-foreground group-hover:text-primary transition-colors">
                        {pref.label}
                      </p>
                      <p className="text-foreground/60 text-sm mt-0.5 leading-relaxed">
                        {pref.desc}
                      </p>
                    </div>
                    <div className="flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={settings?.[pref.field] ?? true}
                        disabled={updatingSettings}
                        onChange={() =>
                          updateSettings({ [pref.field]: !(settings?.[pref.field] ?? true) })
                        }
                        className="w-4 h-4 accent-primary cursor-pointer disabled:opacity-50"
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
