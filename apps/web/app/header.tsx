export function Header() {
  return (
    <header className="flex items-center justify-between p-6">
      {' '}
      {/* Logo */}
      <div className="flex items-center">
        <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white">
          <span className="text-sm font-bold text-black">M</span>
        </div>
        <span className="text-lg font-semibold text-white">motiion</span>
      </div>
      {/* Navigation Links */}
      <nav className="hidden items-center space-x-8 md:flex">
        <a href="#" className="text-white hover:text-gray-300">
          Search
        </a>
        <a href="#" className="text-white hover:text-gray-300">
          Lists
        </a>
        <a href="#" className="text-white hover:text-gray-300">
          Resources
        </a>
      </nav>
      {/* User Menu */}
      <div className="flex items-center space-x-4">
        <button className="p-2">
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600">
          <span className="text-sm font-medium text-white">AD</span>
        </div>
      </div>
    </header>
  )
}