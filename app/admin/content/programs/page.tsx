"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, BookOpen } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

export default function ProgramsContentPage() {
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
              <BookOpen className="h-6 w-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Programs & Curriculum
              </h1>
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
          <h2 className="text-xl font-semibold mb-4">Program Management</h2>
          <p className="text-gray-600 mb-4">
            Manage program details, pricing, and curriculum content.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Foundation Program</h3>
              <p className="text-sm text-gray-600 mb-2">Ages 8-11, Key Stage 2</p>
              <p className="text-lg font-bold text-blue-600">£60/month</p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Elevate Program</h3>
              <p className="text-sm text-gray-600 mb-2">Ages 11-14, Key Stage 3</p>
              <p className="text-lg font-bold text-blue-600">£80/month</p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Excel Program (GCSE)</h3>
              <p className="text-sm text-gray-600 mb-2">Ages 14-16</p>
              <p className="text-lg font-bold text-blue-600">£100/month</p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Advanced Program (A-Level)</h3>
              <p className="text-sm text-gray-600 mb-2">Ages 16-18</p>
              <p className="text-lg font-bold text-blue-600">£120/month</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Content Management</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programs Page Description
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 h-32"
                  placeholder="Update the programs page introduction text..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}