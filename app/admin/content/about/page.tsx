"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Award } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

export default function AboutContentPage() {
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
              <Award className="h-6 w-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">About Page</h1>
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
          <h2 className="text-xl font-semibold mb-4">About Page Content</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Educator Profile - Introduction
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 h-32"
                placeholder="Update Hakim's introduction and background..."
                defaultValue="Meet Hakim, your dedicated educator bringing multi-disciplinary expertise to personalised learning..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualifications & Experience
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 h-32"
                placeholder="Professional qualifications and teaching experience..."
                defaultValue="With extensive experience across healthcare, business, and education..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mission Statement
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 h-24"
                placeholder="Our mission and educational philosophy..."
                defaultValue="To provide transformative, personalised education that prepares students for a changing world..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vision Statement
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 h-24"
                placeholder="Our vision for the future of education..."
                defaultValue="Creating confident, adaptable learners who thrive in an interconnected world..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}