"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Trash2,
  GraduationCap,
  Download,
  Upload,
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useData } from "@/contexts/DataContext";
import type { HeroContent, PhilosophyPrinciple, Testimonial } from "@/lib/data";

export default function HomepageContentAdmin() {
  const { isAuthenticated } = useAdmin();
  const {
    homepageData,
    updateHomepageData,
    resetHomepageData,
    exportData,
    importData,
    isLoading,
    lastSaved,
  } = useData();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin");
    }
  }, [isAuthenticated, router]);

  // Local state for editing
  const [heroContent, setHeroContent] = useState<HeroContent>(
    homepageData.hero,
  );
  const [principles, setPrinciples] = useState<PhilosophyPrinciple[]>(
    homepageData.philosophy,
  );
  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    homepageData.testimonials,
  );

  // Update local state when homepageData changes
  useEffect(() => {
    setHeroContent(homepageData.hero);
    setPrinciples(homepageData.philosophy);
    setTestimonials(homepageData.testimonials);
  }, [homepageData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateHomepageData({
        hero: heroContent,
        philosophy: principles,
        testimonials: testimonials,
      });

      if (success) {
        setMessage("Content saved successfully!");
      } else {
        setMessage("Error saving content. Please try again.");
      }
    } catch (error) {
      console.error("Error saving:", error);
      setMessage("Error saving content. Please try again.");
    }

    setTimeout(() => setMessage(""), 3000);
    setIsSaving(false);
  };

  const handleReset = async () => {
    if (
      confirm(
        "Are you sure you want to reset all content to defaults? This cannot be undone.",
      )
    ) {
      const success = await resetHomepageData();
      if (success) {
        setMessage("Content reset to defaults successfully!");
      } else {
        setMessage("Error resetting content.");
      }
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleExport = () => {
    const dataStr = exportData();
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `learn-academy-content-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const success = importData(content);
        if (success) {
          setMessage("Content imported successfully!");
        } else {
          setMessage("Error importing content. Please check the file format.");
        }
        setTimeout(() => setMessage(""), 3000);
      };
      reader.readAsText(file);
    }
  };

  const addPrinciple = () => {
    setPrinciples([...principles, { title: "", description: "" }]);
  };

  const removePrinciple = (index: number) => {
    setPrinciples(principles.filter((_, i) => i !== index));
  };

  const updatePrinciple = (
    index: number,
    field: "title" | "description",
    value: string,
  ) => {
    const updated = principles.map((principle, i) =>
      i === index ? { ...principle, [field]: value } : principle,
    );
    setPrinciples(updated);
  };

  const addTestimonial = () => {
    setTestimonials([
      ...testimonials,
      { name: "", role: "", content: "", rating: 5 },
    ]);
  };

  const removeTestimonial = (index: number) => {
    setTestimonials(testimonials.filter((_, i) => i !== index));
  };

  const updateTestimonial = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const updated = testimonials.map((testimonial, i) =>
      i === index ? { ...testimonial, [field]: value } : testimonial,
    );
    setTestimonials(updated);
  };

  if (!isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="mr-4">
                <ArrowLeft className="h-5 w-5 text-gray-600 hover:text-blue-600" />
              </Link>
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Homepage Content
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                target="_blank"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Eye className="h-5 w-5 mr-1" />
                Preview
              </Link>
              <button
                onClick={handleExport}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </button>
              <label className="flex items-center text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
                <Upload className="h-4 w-4 mr-1" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleReset}
                className="text-red-600 hover:text-red-800 transition-colors text-sm"
              >
                Reset to Defaults
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || isLoading}
                className="btn-primary flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded ${
              message.includes("Error") || message.includes("error")
                ? "bg-red-100 border border-red-400 text-red-700"
                : "bg-green-100 border border-green-400 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        {lastSaved && (
          <div className="mb-6 text-sm text-gray-500">
            Last saved: {lastSaved.toLocaleString()}
          </div>
        )}

        {isLoading && (
          <div className="mb-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading content...</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Hero Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Hero Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Title
                </label>
                <input
                  type="text"
                  value={heroContent.title}
                  onChange={(e) =>
                    setHeroContent({ ...heroContent, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <textarea
                  value={heroContent.subtitle}
                  onChange={(e) =>
                    setHeroContent({ ...heroContent, subtitle: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={heroContent.primaryButton}
                    onChange={(e) =>
                      setHeroContent({
                        ...heroContent,
                        primaryButton: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Button Text
                  </label>
                  <input
                    type="text"
                    value={heroContent.secondaryButton}
                    onChange={(e) =>
                      setHeroContent({
                        ...heroContent,
                        secondaryButton: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Philosophy Principles */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Educational Philosophy</h2>
              <button
                onClick={addPrinciple}
                className="btn-secondary text-sm flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Principle
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {principles.map((principle, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-500">
                      Principle {index + 1}
                    </span>
                    <button
                      onClick={() => removePrinciple(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={principle.title}
                    onChange={(e) =>
                      updatePrinciple(index, "title", e.target.value)
                    }
                    placeholder="Principle title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={principle.description}
                    onChange={(e) =>
                      updatePrinciple(index, "description", e.target.value)
                    }
                    placeholder="Principle description"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Testimonials</h2>
              <button
                onClick={addTestimonial}
                className="btn-secondary text-sm flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Testimonial
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-500">
                      Testimonial {index + 1}
                    </span>
                    <button
                      onClick={() => removeTestimonial(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={testimonial.name}
                      onChange={(e) =>
                        updateTestimonial(index, "name", e.target.value)
                      }
                      placeholder="Parent name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={testimonial.role}
                      onChange={(e) =>
                        updateTestimonial(index, "role", e.target.value)
                      }
                      placeholder="Role/relationship"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={testimonial.content}
                      onChange={(e) =>
                        updateTestimonial(index, "content", e.target.value)
                      }
                      placeholder="Testimonial content"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={testimonial.rating}
                      onChange={(e) =>
                        updateTestimonial(
                          index,
                          "rating",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={5}>5 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={3}>3 Stars</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
