export default function HomePage() {
  // Placeholder dancer images - in production these would come from your database
  const dancers = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Dancer ${i + 1}`,
    initials: `D${i + 1}`
  }))

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-black">
        {/* Logo */}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
            <span className="text-black font-bold text-sm">M</span>
          </div>
          <span className="text-white font-semibold text-lg">motiion</span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-white hover:text-gray-300">Search</a>
          <a href="#" className="text-white hover:text-gray-300">Lists</a>
          <a href="#" className="text-white hover:text-gray-300">Resources</a>
        </nav>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <button className="p-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">AD</span>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            <h1 className="text-4xl md:text-5xl font-normal">
              The search for <span className="text-emerald-400">professional</span> dance talent made easy.
            </h1>
            <span className="bg-gray-800 text-gray-300 text-sm px-3 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-16 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Location</label>
              <select disabled className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 opacity-75 cursor-not-allowed">
                <option>Los Angeles, CA</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Gender</label>
              <select disabled className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 opacity-75 cursor-not-allowed">
                <option>Male</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Ethnicity</label>
              <select disabled className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 opacity-75 cursor-not-allowed">
                <option>Black/African Amer...</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Height</label>
              <div className="flex gap-2">
                <select disabled className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 opacity-75 cursor-not-allowed">
                  <option>5'8"</option>
                </select>
                <button disabled className="bg-white text-black rounded-lg p-2.5 opacity-75 cursor-not-allowed">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Talent Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-16">
          {dancers.map((dancer) => (
            <div key={dancer.id} className="group cursor-pointer">
              <div className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-gray-300 text-lg font-medium">{dancer.initials}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">© 2025 Motiion</p>
              <a href="#" className="text-gray-400 hover:text-gray-300 text-sm">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-gray-300 text-sm">Terms</a>
              <a href="#" className="text-gray-400 hover:text-gray-300 text-sm">Sitemap</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-gray-300 text-sm">English (US)</button>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-400 hover:text-gray-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}