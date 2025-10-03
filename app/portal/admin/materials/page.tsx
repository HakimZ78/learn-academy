"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { BookOpen, Plus, Eye, Trash2, Upload, Calendar } from "lucide-react";

interface Material {
  id: string;
  title: string;
  description: string | null;
  week_number: number | null;
  subject: string;
  program_level: string;
  is_active: boolean;
  created_at: string;
  _count?: {
    assignments: number;
  };
}

export default function ManageMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data } = await (supabase as any)
        .from("materials")
        .select("*")
        .order("created_at", { ascending: false });

      // Get assignment counts for each material
      if (data) {
        const materialsWithCounts = await Promise.all(
          data.map(async (material: any) => {
            const { count } = await (supabase as any)
              .from("student_assignments")
              .select("*", { count: "exact", head: true })
              .eq("material_id", material.id);

            return {
              ...material,
              _count: { assignments: count || 0 },
            };
          }),
        );
        setMaterials(materialsWithCounts);
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (materialId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this material? This will also remove all related assignments and logs.",
      )
    ) {
      return;
    }

    setDeletingId(materialId);
    try {
      const response = await fetch("/api/admin/delete-material", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ materialId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete material");
      }

      // Remove from local state
      setMaterials(materials.filter((m) => m.id !== materialId));
    } catch (error: any) {
      console.error("Error deleting material:", error);
      alert(`Failed to delete material: ${error.message || 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (materialId: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from("materials")
        .update({ is_active: !currentStatus })
        .eq("id", materialId);

      if (error) throw error;

      // Update local state
      setMaterials(
        materials.map((m) =>
          m.id === materialId ? { ...m, is_active: !currentStatus } : m,
        ),
      );
    } catch (error) {
      console.error("Error updating material status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Manage Materials
                </h1>
                <p className="mt-2 text-gray-600">
                  View and manage all learning materials
                </p>
              </div>
              <Link
                href="/portal/admin/materials/upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload New Material
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject / Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Week
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {materials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <BookOpen className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {material.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {material.description || "No description"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {material.subject}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {material.program_level}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.week_number || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material._count?.assignments || 0} students
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() =>
                          toggleActive(material.id, material.is_active)
                        }
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                          material.is_active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {material.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/portal/admin/materials/${material.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(material.id)}
                          disabled={deletingId === material.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Delete material"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {materials.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No materials yet
              </h3>
              <p className="text-gray-500 mb-4">
                Upload your first material to get started
              </p>
              <Link
                href="/portal/admin/materials/upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Material
              </Link>
            </div>
          )}
        </div>

        <div className="mt-8">
          <Link
            href="/portal/admin"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
