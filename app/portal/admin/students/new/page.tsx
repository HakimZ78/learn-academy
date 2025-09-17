"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  Mail,
  User,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function NewStudentPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    programType: "gcse",
    dateOfBirth: "",
    parentName: "",
    parentEmail: "",
    notes: "",
    createLogin: false,
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let userId = null;

      // Create auth user if requested
      if (formData.createLogin) {
        if (!formData.password) {
          setError("Password is required to create login");
          setLoading(false);
          return;
        }

        // Note: Creating users via client requires admin privileges
        // In production, you might want to use a server action or edge function
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: formData.email,
            password: formData.password,
            options: {
              emailRedirectTo: `https://learn-academy.co.uk/portal/login`,
              data: {
                full_name: formData.fullName,
              },
            },
          },
        );

        if (authError) {
          throw new Error(`Failed to create login: ${authError.message}`);
        }

        userId = authData.user?.id;

        // Create profile for the new user
        if (userId) {
          await (supabase as any).from("profiles").insert({
            id: userId,
            role: "student",
            full_name: formData.fullName,
          });
        }
      }

      // Create student record
      const { error: studentError } = await (supabase as any)
        .from("students")
        .insert({
          user_id: userId,
          email: formData.email,
          full_name: formData.fullName,
          program_type: formData.programType,
          date_of_birth: formData.dateOfBirth || null,
          parent_name: formData.parentName || null,
          parent_email: formData.parentEmail || null,
          notes: formData.notes || null,
          active: true,
        });

      if (studentError) {
        throw studentError;
      }

      setSuccess(`Successfully created student: ${formData.fullName}`);

      setTimeout(() => {
        router.push("/portal/admin/students");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center">
              <Link
                href="/portal/admin/students"
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Add New Student
                </h1>
                <p className="mt-2 text-gray-600">
                  Create a new student account
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Student Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Student Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Level *
                </label>
                <select
                  value={formData.programType}
                  onChange={(e) =>
                    setFormData({ ...formData, programType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="foundation">Foundation</option>
                  <option value="elevate">Elevate</option>
                  <option value="gcse">GCSE</option>
                  <option value="a-level">A-Level</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional notes about the student..."
              />
            </div>
          </div>

          {/* Parent Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Parent/Guardian Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Name
                </label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) =>
                    setFormData({ ...formData, parentName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Email
                </label>
                <input
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, parentEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Login Credentials */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Login Credentials (Optional)
            </h3>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.createLogin}
                  onChange={(e) =>
                    setFormData({ ...formData, createLogin: e.target.checked })
                  }
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Create login credentials for this student
                </span>
              </label>
            </div>

            {formData.createLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a secure password"
                />
                <p className="mt-1 text-xs text-gray-500">
                  The student will use their email and this password to login
                </p>
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> If email validation fails, create the
                    student without login first. Then use Supabase Dashboard →
                    Authentication → Users to manually create their login.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/portal/admin/students"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
