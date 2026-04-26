export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-6 px-4 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
        <p>© {new Date().getFullYear()} Dr. Premila Hewage | Pause Sleep</p>
        <div className="flex items-center gap-4">
          <a href="/privacy" className="hover:text-primary-500 transition-colors">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-primary-500 transition-colors">
            Terms of Service
          </a>
          <a
            href="https://www.pausesleep.com.au"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-500 transition-colors"
          >
            pausesleep.com.au
          </a>
        </div>
      </div>
    </footer>
  );
}
