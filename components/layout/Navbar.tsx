"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode, setDemoMode } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  BarChart2,
  FileText,
  Pill,
  Leaf,
  Settings,
  LogOut,
  Grid3x3,
  X,
} from "lucide-react";

// Primary 5 tabs shown in bottom bar
const primaryTabs = [
  { href: "/dashboard",     label: "Home",     icon: LayoutDashboard },
  { href: "/log",           label: "Log",      icon: BookOpen },
  { href: "/insights",      label: "Insights", icon: BarChart2 },
  { href: "/doctor-report", label: "Report",   icon: FileText },
];

// Secondary items in "More" sheet
const moreItems = [
  { href: "/treatments",  label: "Treatments",  icon: Pill },
  { href: "/supplements", label: "Supplements", icon: Leaf },
  { href: "/settings",    label: "Settings",    icon: Settings },
];

// Full sidebar items for desktop
const sidebarItems = [
  { href: "/dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { href: "/log",           label: "Daily Log",     icon: BookOpen },
  { href: "/insights",      label: "Insights",      icon: BarChart2 },
  { href: "/doctor-report", label: "Doctor Report", icon: FileText },
  { href: "/treatments",    label: "Treatments",    icon: Pill },
  { href: "/supplements",   label: "Supplements",   icon: Leaf },
  { href: "/settings",      label: "Settings",      icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const isMoreActive = moreItems.some((i) => isActive(i.href));

  async function handleSignOut() {
    setSigningOut(true);
    if (isDemoMode()) {
      setDemoMode(false);
      router.push("/login");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      {/* ─── Desktop sidebar ─── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 z-30"
             style={{ background: "linear-gradient(180deg, #ffffff 0%, #faf9f7 100%)",
                      borderRight: "1px solid rgba(15,14,34,0.07)",
                      boxShadow: "2px 0 16px rgba(15,14,34,0.05)" }}>
        {/* Logo */}
        <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(15,14,34,0.07)" }}>
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/pausesleep-logo.png" alt="Pause Sleep" width={46} height={46} className="rounded-full flex-shrink-0" style={{ boxShadow: "0 2px 8px rgba(27,26,68,0.18)" }} />
            <div>
              <p className="font-bold text-sm text-[#0F0E22]" style={{ fontFamily: "Poppins, sans-serif", letterSpacing: "-0.01em" }}>
                Pause Sleep
              </p>
              <p className="text-xs text-gray-500 font-medium">Symptom Tracker</p>
            </div>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {sidebarItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150",
                isActive(href)
                  ? "text-primary-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
              style={isActive(href) ? {
                background: "linear-gradient(135deg, #EEEDF5, #E8F2EF)",
                boxShadow: "inset 0 1px 2px rgba(27,26,68,0.06)"
              } : {}}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", isActive(href) ? "text-primary-600" : "text-gray-500")} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 space-y-0.5" style={{ borderTop: "1px solid rgba(15,14,34,0.07)" }}>
          <a
            href="https://www.pausesleep.com.au"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 text-xs text-gray-500 hover:text-primary-600 font-medium transition-colors rounded-xl hover:bg-primary-50"
          >
            ← pausesleep.com.au
          </a>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-xl text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            {signingOut ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* ─── Mobile: slim top bar ─── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 glass"
           style={{ borderBottom: "1px solid rgba(15,14,34,0.08)", paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image src="/pausesleep-logo.png" alt="Pause Sleep" width={32} height={32} className="rounded-full" style={{ boxShadow: "0 1px 6px rgba(27,26,68,0.18)" }} />
            <span className="font-bold text-sm text-[#0F0E22]" style={{ fontFamily: "Poppins, sans-serif", letterSpacing: "-0.01em" }}>
              Pause Sleep
            </span>
          </Link>
          <span className="text-xs font-semibold text-gray-500 bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full">
            Tracker
          </span>
        </div>
      </div>

      {/* ─── Mobile: bottom tab bar ─── */}
      <nav className="bottom-nav md:hidden">
        <div className="flex items-stretch h-16">
          {primaryTabs.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-150 active:scale-95"
              >
                <div className={cn(
                  "flex items-center justify-center w-10 h-6 rounded-full transition-all duration-200",
                  active ? "bg-primary-100" : ""
                )}>
                  <Icon className={cn("w-5 h-5 transition-colors", active ? "text-primary-700" : "text-gray-500")} />
                </div>
                <span className={cn(
                  "text-[10px] font-semibold leading-none transition-colors",
                  active ? "text-primary-700" : "text-gray-500"
                )}>
                  {label}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-150 active:scale-95"
          >
            <div className={cn(
              "flex items-center justify-center w-10 h-6 rounded-full transition-all duration-200",
              isMoreActive ? "bg-primary-100" : ""
            )}>
              <Grid3x3 className={cn("w-5 h-5 transition-colors", isMoreActive ? "text-primary-700" : "text-gray-500")} />
            </div>
            <span className={cn(
              "text-[10px] font-semibold leading-none transition-colors",
              isMoreActive ? "text-primary-700" : "text-gray-500"
            )}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* ─── More sheet backdrop ─── */}
      {moreOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* ─── More sheet ─── */}
      <div
        className={cn(
          "md:hidden fixed left-0 right-0 z-50 bg-white rounded-t-3xl transition-all duration-300",
          moreOpen ? "bottom-0" : "-bottom-full"
        )}
        style={{ boxShadow: "0 -8px 40px rgba(15,14,34,0.16)", paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
      >
        {/* Sheet handle */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 pb-4">
          <p className="font-bold text-[#0F0E22]" style={{ fontFamily: "Poppins, sans-serif" }}>More</p>
          <button onClick={() => setMoreOpen(false)} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-4 pb-2 space-y-1">
          {moreItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMoreOpen(false)}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all",
                isActive(href)
                  ? "text-primary-700"
                  : "text-gray-700 hover:bg-gray-50"
              )}
              style={isActive(href) ? {
                background: "linear-gradient(135deg, #EEEDF5, #E8F2EF)"
              } : {}}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                isActive(href) ? "bg-primary-100" : "bg-gray-100"
              )}>
                <Icon className={cn("w-5 h-5", isActive(href) ? "text-primary-600" : "text-gray-600")} />
              </div>
              {label}
            </Link>
          ))}

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-4 px-4 py-3.5 w-full rounded-2xl font-semibold text-sm text-red-600 hover:bg-red-50 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            {signingOut ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </div>
    </>
  );
}
