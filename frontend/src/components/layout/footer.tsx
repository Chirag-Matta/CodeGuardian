export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2024 PR Review Agent. Powered by Gemini AI.
          </p>
          <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
            <a href="https://github.com" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              GitHub
            </a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Documentation
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
