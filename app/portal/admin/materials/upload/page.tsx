"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function UploadMaterialPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "biology",
    programLevel: "gcse",
    weekNumber: "",
    file: null as File | null,
    htmlContent: "",
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, file }));

    // If it's an HTML file, read its content
    if (file.type === "text/html" || file.name.endsWith(".html")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFormData((prev) => ({ ...prev, htmlContent: content }));

        // Try to extract title from HTML
        const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
        if (titleMatch && !formData.title) {
          setFormData((prev) => ({
            ...prev,
            title: titleMatch[1].replace(/<[^>]*>/g, ""),
          }));
        }

        // Extract week number from filename
        const weekMatch = file.name.match(/week[_\s]?(\d+)/i);
        if (weekMatch && !formData.weekNumber) {
          setFormData((prev) => ({ ...prev, weekNumber: weekMatch[1] }));
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload file to storage
      let filePath = "";
      if (formData.file) {
        const fileExt = formData.file.name.split(".").pop();
        const fileName = `${formData.subject}/week_${formData.weekNumber || "misc"}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("materials")
          .upload(fileName, formData.file);

        if (uploadError) throw uploadError;
        filePath = uploadData.path;
      }

      // Create material record
      const { data, error: dbError } = await (supabase as any)
        .from("materials")
        .insert({
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          program_level: formData.programLevel,
          week_number: formData.weekNumber
            ? parseInt(formData.weekNumber)
            : null,
          file_path: filePath,
          file_type: "html",
          content_html: formData.htmlContent,
          created_by: user.id,
          is_active: true,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setSuccess(true);
      setTimeout(() => {
        router.push("/portal/admin");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to upload material");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/portal/admin"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Admin Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Material
          </h1>
          <p className="text-gray-600">Add new study material for students</p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-green-900 mb-2">
              Material Uploaded Successfully!
            </h2>
            <p className="text-green-700">Redirecting to dashboard...</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,text/html"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                {formData.file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-academy-primary" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        {formData.file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(formData.file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="ml-4 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 mx-auto"
                  >
                    <Upload className="w-12 h-12 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Click to upload HTML file
                    </span>
                    <span className="text-xs text-gray-500">
                      Files will be view-only for students
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title *
              </label>
              <input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-academy-primary focus:border-transparent outline-none"
                placeholder="e.g., Cell Biology Questions"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-academy-primary focus:border-transparent outline-none"
                placeholder="Brief description of the material content"
              />
            </div>

            {/* Subject and Level */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Subject *
                </label>
                <select
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-academy-primary focus:border-transparent outline-none"
                >
                  <option value="biology">Biology</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="physics">Physics</option>
                  <option value="mathematics">Mathematics</option>
                  <option value="english">English</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="programLevel"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Program Level *
                </label>
                <select
                  id="programLevel"
                  required
                  value={formData.programLevel}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      programLevel: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-academy-primary focus:border-transparent outline-none"
                >
                  <option value="foundation">Foundation</option>
                  <option value="elevate">Elevate</option>
                  <option value="gcse">GCSE</option>
                  <option value="a-level">A-Level</option>
                </select>
              </div>
            </div>

            {/* Week Number */}
            <div className="mb-6">
              <label
                htmlFor="weekNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Week Number
              </label>
              <input
                id="weekNumber"
                type="number"
                min="1"
                max="52"
                value={formData.weekNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    weekNumber: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-academy-primary focus:border-transparent outline-none"
                placeholder="e.g., 5"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Link
                href="/portal/admin"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={uploading || !formData.file}
                className="px-6 py-2 bg-gradient-to-r from-academy-primary to-academy-accent text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Upload Material"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
