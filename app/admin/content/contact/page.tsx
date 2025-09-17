"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Mail } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

export default function ContactContentPage() {
  const { isAuthenticated } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link
                href="/admin/dashboard"
                className="mr-4 text-gray-600 hover:text-blue-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <Mail className="h-6 w-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Contact Information</h1>
            </div>
            <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Contact Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg p-3"
                defaultValue="admin@learn-academy.co.uk"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg p-3"
                defaultValue="07779-602503"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-3"
                defaultValue="Office, B8 1AE"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Office Hours
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-3"
                defaultValue="Monday - Saturday, 9:00 AM - 6:00 PM GMT"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number
              </label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg p-3"
                defaultValue="447779602503"
              />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">FAQ Management</h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">What are your class sizes?</h4>
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                </div>
                <p className="text-sm text-gray-600">
                  1 on 1 for all levels. This personalised approach ensures each student receives focused attention...
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Do you follow the National Curriculum?</h4>
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                </div>
                <p className="text-sm text-gray-600">
                  Yes, we exceed National Curriculum requirements while adding our interdisciplinary approach...
                </p>
              </div>

              <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-blue-300 hover:text-blue-600">
                + Add New FAQ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}