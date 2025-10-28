import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-6xl font-bold text-gray-900">
          Campus<span className="text-blue-600">Connect</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Smart Placement Management Portal for BMSCE
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Login
          </Link>
          <Link
            href="/about"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
          >
            Learn More
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-lg font-semibold mb-2">For Students</h3>
            <p className="text-gray-600 text-sm">
              Track applications, view drives, and manage your placement journey
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">For Admins</h3>
            <p className="text-gray-600 text-sm">
              Manage drives, upload shortlists, and track placement statistics
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
            <p className="text-gray-600 text-sm">
              Get instant notifications for deadlines, shortlists, and events
            </p>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Built with ❤️ for BMSCE Placement Cell</p>
        </div>
      </div>
    </div>
  );
}
