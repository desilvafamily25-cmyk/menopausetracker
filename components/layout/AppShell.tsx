"use client";

import { usePathname } from "next/navigation";

const PAGE_BG: Record<string, string> = {
  "/dashboard":     "linear-gradient(160deg, #FFF5EE 0%, #FBF4EC 55%)",
  "/log":           "linear-gradient(160deg, #F1F5F3 0%, #FBF4EC 55%)",
  "/insights":      "linear-gradient(160deg, #F8E7E1 0%, #FBF4EC 55%)",
  "/doctor-report": "linear-gradient(160deg, #F0F4F8 0%, #FBF4EC 55%)",
  "/treatments":    "linear-gradient(160deg, #EEF5F2 0%, #FBF4EC 55%)",
  "/supplements":   "linear-gradient(160deg, #EEF5F2 0%, #FBF4EC 55%)",
  "/settings":      "linear-gradient(160deg, #F4F2F9 0%, #FBF4EC 55%)",
  "/onboarding":    "linear-gradient(160deg, #F8E7E1 0%, #FBF4EC 55%)",
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bg = PAGE_BG[pathname] ?? "linear-gradient(160deg, #FBF4EC 0%, #FBF4EC 100%)";

  return (
    <div
      className="min-h-screen transition-all duration-700"
      style={{ background: bg }}
    >
      {children}
    </div>
  );
}
