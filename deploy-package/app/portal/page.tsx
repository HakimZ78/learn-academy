import Link from "next/link";
import { ArrowRight, BookOpen, Settings } from "lucide-react";

export default function PortalHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-academy-primary via-academy-secondary to-academy-accent flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-academy-primary to-academy-accent rounded-lg flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Learn Academy Portal
          </h1>
          <p className="text-gray-600 mb-8">
            Secure access to your pre-session materials and assignments
          </p>

          <div className="space-y-4">
            <Link
              href="/portal/login"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-academy-primary to-academy-accent text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
            >
              Student Login
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Main Site
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              For technical support, please contact your administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
