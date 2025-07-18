export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center max-w-2xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            Motiion
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            The dance ecosystem in motion.<br />
            Connect with dancers, choreographers, and agencies on the move.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Coming Soon
          </h2>
          <p className="text-gray-600 mb-6">
            We're building something amazing for the dance community. 
            Stay tuned for the launch of our platform.
          </p>
          <div className="flex justify-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">🕺</div>
              <p className="text-sm text-gray-500 mt-2">Dancers</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">🎭</div>
              <p className="text-sm text-gray-500 mt-2">Choreographers</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">🏢</div>
              <p className="text-sm text-gray-500 mt-2">Agencies</p>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-400">
          Website under construction
        </p>
      </div>
    </div>
  )
}