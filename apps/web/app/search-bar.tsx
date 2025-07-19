export function SearchBar() {
  return (
    <div className="mx-auto mb-16 max-w-5xl px-4 md:px-0">
      <div className="relative overflow-hidden rounded-[1000px] bg-[rgba(28,29,32,0.5)]">
        <div className="absolute inset-0 rounded-[1000px] border border-[#4b4a5e]" />
        <div className="relative flex items-center px-4 py-2 pr-2 md:px-8">
          <div className="flex flex-1 items-center gap-3 overflow-x-auto md:gap-6">
            {/* Location */}
            <div className="w-[110px] shrink-0 md:w-[130px]">
              <div className="text-xs font-semibold text-[#dddddd]">
                Location
              </div>
              <div className="text-sm text-gray-500">Los Angeles, CA</div>
            </div>

            {/* Divider */}
            <div className="hidden h-8 w-px bg-[#4b4a5e] md:block" />

            {/* Gender */}
            <div className="hidden w-[130px] shrink-0 md:block">
              <div className="text-xs font-semibold text-[#dddddd]">
                Gender
              </div>
              <div className="text-sm text-gray-500">Male</div>
            </div>

            {/* Divider */}
            <div className="hidden h-8 w-px bg-[#4b4a5e] md:block" />

            {/* Ethnicity */}
            <div className="hidden w-[130px] shrink-0 lg:block">
              <div className="text-xs font-semibold text-[#dddddd]">
                Ethnicity
              </div>
              <div className="truncate text-sm text-gray-500">
                Black/African Amer...
              </div>
            </div>

            {/* Divider */}
            <div className="hidden h-8 w-px bg-[#4b4a5e] lg:block" />

            {/* Height */}
            <div className="hidden w-[130px] shrink-0 lg:block">
              <div className="text-xs font-semibold text-[#dddddd]">
                Height
              </div>
              <div className="text-sm text-gray-500">5'8" - 5'11"</div>
            </div>

            {/* More Options */}
            <button className="ml-auto p-2 text-gray-500 hover:text-gray-300 md:ml-0">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>

            {/* Search Button */}
            <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-[0px_3px_7px_0px_rgba(0,0,0,0.25)] transition-transform hover:scale-105">
              <svg
                className="h-6 w-6 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}