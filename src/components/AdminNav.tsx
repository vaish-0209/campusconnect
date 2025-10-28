import Link from "next/link";

interface AdminNavProps {
  currentPage: "dashboard" | "students" | "companies" | "drives";
}

export default function AdminNav({ currentPage }: AdminNavProps) {
  return (
    <nav className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin/dashboard">
              <h1 className="text-xl font-semibold text-white tracking-wide">CAMPUSCONNECT</h1>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/dashboard"
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  currentPage === "dashboard"
                    ? "text-white bg-gray-800"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/students"
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  currentPage === "students"
                    ? "text-white bg-gray-800"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                Students
              </Link>
              <Link
                href="/admin/companies"
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  currentPage === "companies"
                    ? "text-white bg-gray-800"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                Companies
              </Link>
              <Link
                href="/admin/drives"
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  currentPage === "drives"
                    ? "text-white bg-gray-800"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                Drives
              </Link>
            </div>
          </div>
          <div>
            <button className="px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-medium rounded-full hover:from-purple-500 hover:to-purple-400 transition-all">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
