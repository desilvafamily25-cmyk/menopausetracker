import Navbar from "@/components/layout/Navbar";
import AppShell from "@/components/layout/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <Navbar />
      {/* Desktop: offset for sidebar; Mobile: offset for top bar + bottom tab bar */}
      <main className="md:ml-64 pt-14 md:pt-0 pb-28 md:pb-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
          {children}
        </div>
      </main>
    </AppShell>
  );
}
