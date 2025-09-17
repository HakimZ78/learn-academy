"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  BookOpen,
  Calendar,
  AlertCircle,
} from "lucide-react";
import type { Database } from "@/types/database";

type StudentAssignmentInsert =
  Database["public"]["Tables"]["student_assignments"]["Insert"];

interface Student {
  id: string;
  full_name: string;
  email: string;
  program_type: string;
}

interface Material {
  id: string;
  title: string;
  subject: string;
  week_number: number | null;
  program_level: string;
}

export default function NewAssignmentPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [accessEnd, setAccessEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch students
      const { data: studentsData } = await supabase
        .from("students")
        .select("id, full_name, email, program_type")
        .eq("active", true)
        .order("full_name");

      // Fetch materials
      const { data: materialsData } = await supabase
        .from("materials")
        .select("id, title, subject, week_number, program_level")
        .eq("is_active", true)
        .order("week_number", { ascending: true });

      setStudents(studentsData || []);
      setMaterials(materialsData || []);
    } catch (err) {
      setError("Failed to load data");
    }
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleSelectAllStudents = () => {
    setSelectedStudents(
      selectedStudents.length === students.length
        ? []
        : students.map((s) => s.id),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (selectedStudents.length === 0) {
      setError("Please select at least one student");
      setLoading(false);
      return;
    }

    if (!selectedMaterial) {
      setError("Please select a material");
      setLoading(false);
      return;
    }

    try {
      const assignments: StudentAssignmentInsert[] = selectedStudents.map(
        (studentId) => ({
          student_id: studentId,
          material_id: selectedMaterial,
          due_date: dueDate || null,
          access_start: new Date().toISOString(),
          access_end: accessEnd || null,
        }),
      );

      const { error: insertError } = await (supabase as any)
        .from("student_assignments")
        .insert(assignments);

      if (insertError) {
        throw insertError;
      }

      setSuccess(
        `Successfully assigned material to ${selectedStudents.length} student(s)`,
      );

      // Reset form
      setSelectedStudents([]);
      setSelectedMaterial("");
      setDueDate("");
      setAccessEnd("");

      setTimeout(() => {
        router.push("/portal/admin/assignments");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create assignments");
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
                href="/portal/admin/assignments"
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Create New Assignment
                </h1>
                <p className="mt-2 text-gray-600">
                  Assign materials to students
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

          {/* Select Material */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Select Material
            </h3>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose a material...</option>
              {materials.map((material) => (
                <option key={material.id} value={material.id}>
                  Week {material.week_number || "N/A"} - {material.title} (
                  {material.subject} • {material.program_level})
                </option>
              ))}
            </select>
          </div>

          {/* Select Students */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Select Students ({selectedStudents.length})
              </h3>
              <button
                type="button"
                onClick={handleSelectAllStudents}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {selectedStudents.length === students.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {students.map((student) => (
                <label
                  key={student.id}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleStudentToggle(student.id)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {student.full_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {student.email} • {student.program_type}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {students.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No students found
              </p>
            )}
          </div>

          {/* Assignment Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Assignment Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Expires (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={accessEnd}
                  onChange={(e) => setAccessEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/portal/admin/assignments"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
