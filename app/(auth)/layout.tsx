import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/layout/Footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-white to-teal-50">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/pausesleep-logo.png"
            alt="Pause Sleep"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="font-semibold text-[#1B1A44]" style={{ fontFamily: "Poppins, sans-serif" }}>
            Pause Sleep
          </span>
        </Link>
        <a
          href="https://www.pausesleep.com.au"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-500 hover:text-primary-500 transition-colors"
        >
          ← Back to pausesleep.com.au
        </a>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      <Footer />
    </div>
  );
}
