"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Users,
  Plus,
  Mail,
  Calendar,
  Edit,
  Trash2,
  UserPlus,
} from "lucide-react";

interface Student {
  id: string;
  full_name: string;
  email: string;
  program_type: string;
  parent_name?: string;
  parent_email?: string;
  active: boolean;
  user_id?: string;
  student_assignments?: any[];
}

interface StudentManagementProps {
  students: Student[];
}

export default function StudentManagement({ students: initialStudents }: StudentManagementProps) {
  const router = useRouter();
  const supabase = createClient();
  const [students, setStudents] = useState(initialStudents);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteStudent = async (studentId: string, userId?: string) => {
    if (!confirm("Are you sure you want to delete this student? This will also delete all their assignments and materials.")) {
      return;
    }

    setDeletingId(studentId);
    try {
      // Delete student assignments first
      const { error: assignmentsError } = await supabase
        .from("student_assignments")
        .delete()
        .eq("student_id", studentId);

      if (assignmentsError) {
        console.error("Error deleting student assignments:", assignmentsError);
      }

      // Delete student materials
      const { error: materialsError } = await supabase
        .from("student_materials")
        .delete()
        .eq("student_id", studentId);

      if (materialsError) {
        console.error("Error deleting student materials:", materialsError);
      }

      // Delete the student record
      const { error: studentError } = await supabase
        .from("students")
        .delete()
        .eq("id", studentId);

      if (studentError) {
        console.error("Error deleting student:", studentError);
        alert("Failed to delete student. Please try again.");
        return;
      }

      // If student has a user account, deactivate it (we can't delete users from client)
      if (userId) {
        // Update the profile to mark as deleted
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", userId);

        if (profileError) {
          console.error("Error marking profile as deleted:", profileError);
        }
      }

      // Update local state to remove the deleted student
      setStudents(students.filter(s => s.id !== studentId));

      // Refresh the page to ensure data consistency
      router.refresh();
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("An error occurred while deleting the student");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Parent Contact</TableHead>
              <TableHead>Assignments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students?.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {student.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {student.program_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900">
                    {student.parent_name || "Not provided"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {student.parent_email || "No email"}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-900">
                  {student.student_assignments?.[0]?.count || 0} materials
                </TableCell>
                <TableCell>
                  <Badge variant={student.active ? "default" : "destructive"}>
                    {student.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/portal/admin/students/${student.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteStudent(student.id, student.user_id)}
                      disabled={deletingId === student.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete student"
                    >
                      {deletingId === student.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {(!students || students.length === 0) && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No students yet
          </h3>
          <p className="text-gray-500 mb-4">
            Add your first student to get started
          </p>
          <Link
            href="/portal/admin/students/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Add Student
          </Link>
        </div>
      )}
    </div>
  );
}