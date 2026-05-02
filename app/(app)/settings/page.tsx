"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode, setDemoMode } from "@/lib/demo-data";
import { useUser } from "@/hooks/useUser";
import { useLogs } from "@/hooks/useLogs";
import Card, { CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { CheckCircle, Download, AlertTriangle, Bell, BellOff } from "lucide-react";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  date_of_birth: z.string().optional(),
});

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { logs } = useLogs();
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    } else {
      setNotifPermission("unsupported");
    }
  }, []);

  async function requestNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    if (permission === "granted") {
      new Notification("Pause Sleep", {
        body: "Daily reminders enabled! You'll be reminded to log each evening.",
        icon: "/icons/icon-192.png",
      });
    }
  }

  const {
    register: profileRegister,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name ?? "",
      date_of_birth: user?.date_of_birth ?? "",
    },
  });

  const {
    register: pwRegister,
    handleSubmit: handlePassword,
    reset: resetPassword,
    formState: { errors: pwErrors, isSubmitting: pwSubmitting },
  } = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  async function onProfileSave(data: ProfileData) {
    if (isDemoMode()) { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000); return; }
    const supabase = createClient();
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) return;
    await supabase.from("users").update({
      full_name: data.full_name,
      date_of_birth: data.date_of_birth || null,
    }).eq("id", u.id);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  }

  async function onPasswordSave(data: PasswordData) {
    if (isDemoMode()) { resetPassword(); setPasswordSaved(true); setTimeout(() => setPasswordSaved(false), 3000); return; }
    const supabase = createClient();
    await supabase.auth.updateUser({ password: data.newPassword });
    resetPassword();
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
  }

  function exportCSV() {
    const headers = [
      "Date", "Hot Flushes", "Night Sweats", "Sleep Quality", "Sleep Hours",
      "Mood", "Energy", "Brain Fog", "Joint Pain", "Period", "Alcohol",
      "Caffeine After 2pm", "Spicy Food", "High Stress", "Exercise", "Notes",
    ];
    const rows = logs.map((l) => [
      l.log_date, l.hot_flushes_count, l.night_sweats_count, l.sleep_quality ?? "",
      l.sleep_hours ?? "", l.mood ?? "", l.energy_level ?? "", l.brain_fog ? "Yes" : "No",
      l.joint_pain_level, l.period_today ? "Yes" : "No", l.alcohol_consumed ? "Yes" : "No",
      l.caffeine_after_2pm ? "Yes" : "No", l.spicy_food ? "Yes" : "No",
      l.high_stress ? "Yes" : "No", l.exercise ?? "", (l.notes ?? "").replace(/,/g, ";"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pause-sleep-data-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteAccount() {
    setDeleting(true);
    if (isDemoMode()) { setDemoMode(false); router.push("/"); return; }
    const supabase = createClient();
    const { data: { user: u } } = await supabase.auth.getUser();
    if (u) {
      await supabase.from("daily_logs").delete().eq("user_id", u.id);
      await supabase.from("treatments").delete().eq("user_id", u.id);
      await supabase.from("supplements").delete().eq("user_id", u.id);
      await supabase.from("users").delete().eq("id", u.id);
      await supabase.auth.signOut();
    }
    router.push("/");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="page-header">Settings</h1>
        <p className="page-sub">Manage your account and data</p>
      </div>

      {/* Account info */}
      {user && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Signed in as</p>
              <p className="font-medium text-[#3B241C]">{user.email}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-700 text-xs font-medium px-3 py-1.5 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" />
              Lifetime Access
            </span>
          </div>
        </Card>
      )}

      {/* Profile */}
      <Card>
        <CardTitle className="mb-4">Profile</CardTitle>
        <form onSubmit={handleProfile(onProfileSave)} className="space-y-4">
          <Input
            label="Full name"
            error={profileErrors.full_name?.message}
            {...profileRegister("full_name")}
          />
          <Input
            label="Date of birth (optional)"
            type="date"
            hint="Used for your doctor report"
            {...profileRegister("date_of_birth")}
          />
          {profileSaved && (
            <div className="flex items-center gap-2 text-teal-700 text-sm">
              <CheckCircle className="w-4 h-4" />
              Profile saved
            </div>
          )}
          <Button type="submit" size="sm" loading={profileSubmitting}>Save Profile</Button>
        </form>
      </Card>

      {/* Change password */}
      <Card>
        <CardTitle className="mb-4">Change Password</CardTitle>
        <form onSubmit={handlePassword(onPasswordSave)} className="space-y-4">
          <Input
            label="New password"
            type="password"
            placeholder="Min. 8 characters"
            error={pwErrors.newPassword?.message}
            {...pwRegister("newPassword")}
          />
          <Input
            label="Confirm new password"
            type="password"
            placeholder="••••••••"
            error={pwErrors.confirmPassword?.message}
            {...pwRegister("confirmPassword")}
          />
          {passwordSaved && (
            <div className="flex items-center gap-2 text-teal-700 text-sm">
              <CheckCircle className="w-4 h-4" />
              Password updated
            </div>
          )}
          <Button type="submit" size="sm" loading={pwSubmitting}>Update Password</Button>
        </form>
      </Card>

      {/* Notifications */}
      <Card>
        <CardTitle className="mb-2 flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary-500" />
          Daily Reminders
        </CardTitle>
        <p className="text-sm text-gray-500 mb-4">
          Get a gentle evening reminder to log your symptoms. Consistency is key to great data.
        </p>
        {notifPermission === "unsupported" && (
          <p className="text-sm text-gray-400">Notifications are not supported in this browser.</p>
        )}
        {notifPermission === "granted" && (
          <div className="flex items-center gap-2 text-teal-700">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Reminders are enabled</span>
          </div>
        )}
        {notifPermission === "denied" && (
          <div className="flex items-center gap-2 text-gray-500">
            <BellOff className="w-4 h-4" />
            <span className="text-sm">Notifications blocked — enable in your browser settings to allow reminders.</span>
          </div>
        )}
        {notifPermission === "default" && (
          <Button variant="secondary" size="sm" onClick={requestNotifications} className="gap-2">
            <Bell className="w-4 h-4" />
            Enable Daily Reminder
          </Button>
        )}
      </Card>

      {/* Dr. Premila bio */}
      <Card style={{ background: "linear-gradient(135deg, #F8E7E1 0%, #F3F7F4 100%)", border: "1px solid rgba(59,36,28,0.08)" }}>
        <div className="flex items-start gap-4">
          <Image
            src="/pausesleep-logo.png"
            alt="Dr. Premila Hewage"
            width={56}
            height={56}
            className="rounded-2xl flex-shrink-0"
            style={{ boxShadow: "0 4px 12px rgba(59,36,28,0.18)" }}
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#3B241C]" style={{ fontFamily: "Cormorant Garamond, sans-serif" }}>
              Dr. Premila Hewage
            </p>
            <p className="text-xs text-primary-600 font-semibold mt-0.5">MBBS · FRACGP · Menopause Medicine</p>
            <p className="text-sm text-gray-700 mt-2.5 leading-relaxed">
              Dr. Premila is an Australian General Practitioner with a special interest in women&apos;s health and menopause management. She created Pause Sleep to give every woman the tools to understand her body and have more productive conversations with her GP.
            </p>
            <p className="text-xs text-gray-500 mt-2 italic">
              &ldquo;Menopause is not a disease — it&apos;s a transition. With the right data and support, every woman can thrive through it.&rdquo;
            </p>
          </div>
        </div>
      </Card>

      {/* Data export */}
      <Card>
        <CardTitle className="mb-2">Export Your Data</CardTitle>
        <p className="text-sm text-gray-500 mb-4">
          Download all your symptom data as a CSV file. You own your data.
        </p>
        <Button variant="secondary" size="sm" onClick={exportCSV} className="gap-2">
          <Download className="w-4 h-4" />
          Download CSV ({logs.length} days)
        </Button>
      </Card>

      {/* Delete account */}
      <Card>
        <CardTitle className="mb-2 text-red-600">Delete Account</CardTitle>
        <p className="text-sm text-gray-500 mb-4">
          Permanently delete your account and all symptom data. This cannot be undone.
        </p>
        {!deleteConfirm ? (
          <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(true)}>
            Delete My Account
          </Button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">
                This will permanently delete all your symptom logs, treatments, supplements, and account data.
                This action cannot be reversed.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="danger" size="sm" loading={deleting} onClick={deleteAccount}>
                Yes, Delete Everything
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
