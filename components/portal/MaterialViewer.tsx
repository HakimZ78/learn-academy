"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  Eye,
  Shield,
  AlertCircle,
} from "lucide-react";

interface MaterialViewerProps {
  material: {
    id: string;
    title: string;
    description: string | null;
    content_html: string | null;
    subject: string;
    week_number: number | null;
    program_level: string;
  };
  assignment: {
    id: string;
    due_date: string | null;
    completed: boolean;
    viewed: boolean;
    view_count: number;
  };
  studentId: string;
}

export default function MaterialViewer({
  material,
  assignment,
  studentId,
}: MaterialViewerProps) {
  const router = useRouter();
  const supabase = createClient();
  const contentRef = useRef<HTMLDivElement>(null);
  const [markingComplete, setMarkingComplete] = useState(false);

  // Enhanced copy protection
  useEffect(() => {
    const disableCopy = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const disableKeyboard = (e: KeyboardEvent) => {
      // Disable Ctrl+A, Ctrl+C, Ctrl+X
      if (e.ctrlKey && ["a", "c", "x", "A", "C", "X"].includes(e.key)) {
        e.preventDefault();
        return false;
      }
      // Disable Cmd+A, Cmd+C, Cmd+X on Mac
      if (e.metaKey && ["a", "c", "x", "A", "C", "X"].includes(e.key)) {
        e.preventDefault();
        return false;
      }
    };

    // Apply protection to entire document
    document.addEventListener("copy", disableCopy);
    document.addEventListener("cut", disableCopy);
    document.addEventListener("selectstart", disableCopy);
    document.addEventListener("contextmenu", disableCopy);
    document.addEventListener("keydown", disableKeyboard);

    // Disable text selection globally
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    const style = document.createElement("style");
    style.innerHTML =
      "* { user-select: none !important; -webkit-user-select: none !important; }";
    document.head.appendChild(style);

    // Cleanup
    return () => {
      document.removeEventListener("copy", disableCopy);
      document.removeEventListener("cut", disableCopy);
      document.removeEventListener("selectstart", disableCopy);
      document.removeEventListener("contextmenu", disableCopy);
      document.removeEventListener("keydown", disableKeyboard);
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      style.remove();
    };
  }, []);
  const [sessionStart] = useState(new Date());

  // Prevent right-click
  useEffect(() => {
    const handleContextMenu = (e: any) => {
      e.preventDefault();

      // Log attempt
      (supabase as any)
        .from("access_logs")
        .insert({
          student_id: studentId,
          material_id: material.id,
          action: "copy_attempt",
        })
        .then();
      return false;
    };

    const handlePrint = (e: any) => {
      // Prevent Ctrl+P / Cmd+P
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();

        // Log attempt
        (supabase as any)
          .from("access_logs")
          .insert({
            student_id: studentId,
            material_id: material.id,
            action: "print_attempt",
          })
          .then();
        return false;
      }
    };

    const handleCopy = (e: any) => {
      e.preventDefault();

      // Log attempt
      (supabase as any)
        .from("access_logs")
        .insert({
          student_id: studentId,
          material_id: material.id,
          action: "copy_attempt",
        })
        .then();
      return false;
    };

    // Prevent text selection
    const handleSelectStart = (e: any) => {
      e.preventDefault();
      return false;
    };

    (document as any).addEventListener("contextmenu", handleContextMenu);
    (document as any).addEventListener("keydown", handlePrint);
    (document as any).addEventListener("copy", handleCopy);
    (document as any).addEventListener("selectstart", handleSelectStart);

    // Track session duration on unmount
    return () => {
      (document as any).removeEventListener("contextmenu", handleContextMenu);
      (document as any).removeEventListener("keydown", handlePrint);
      (document as any).removeEventListener("copy", handleCopy);
      (document as any).removeEventListener("selectstart", handleSelectStart);

      // Log session duration
      (supabase as any)
        .from("access_logs")
        .insert({
          student_id: studentId,
          material_id: material.id,
          action: "view",
          session_duration: Math.floor((new Date().getTime() - sessionStart.getTime()) / 1000),
        })
        .then();
    };
  }, [studentId, material.id, sessionStart, supabase]);

  const handleMarkComplete = async () => {
    setMarkingComplete(true);

    const { error } = await (supabase as any)
      .from("student_assignments")
      .update({
        completed: true,
        completed_date: new Date().toISOString(),
      })
      .eq("id", assignment.id);

    if (!error) {
      // Log completion
      await (supabase as any).from("access_logs").insert({
        student_id: studentId,
        material_id: material.id,
        action: "complete",
      });

      router.push("/portal/dashboard");
    } else {
      setMarkingComplete(false);
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      biology: "bg-green-100 text-green-800 border-green-200",
      chemistry: "bg-blue-100 text-blue-800 border-blue-200",
      physics: "bg-purple-100 text-purple-800 border-purple-200",
      mathematics: "bg-yellow-100 text-yellow-800 border-yellow-200",
      english: "bg-pink-100 text-pink-800 border-pink-200",
    };
    return colors[subject] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Copy Protection Styles */}
      <style jsx global>{`
        .material-content {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
          position: relative !important;
          cursor: default !important;
        }

        .material-content * {
          white-space: normal !important;
        }

        .material-content p {
          margin-bottom: 1rem !important;
          line-height: 1.6 !important;
        }

        .material-content h1,
        .material-content h2,
        .material-content h3 {
          margin-top: 1.5rem !important;
          margin-bottom: 1rem !important;
          line-height: 1.4 !important;
        }

        .material-content ul,
        .material-content ol {
          margin-bottom: 1rem !important;
          padding-left: 1.5rem !important;
        }

        .material-content li {
          margin-bottom: 0.5rem !important;
          line-height: 1.5 !important;
        }

        .material-content hr {
          margin: 1.5rem 0 !important;
          border: none !important;
          height: 1px !important;
          background-color: #e5e7eb !important;
        }

        .material-content::selection {
          background: transparent;
        }

        .material-content::-moz-selection {
          background: transparent;
        }

        @media print {
          body * {
            display: none !important;
          }
          body:after {
            content: "Printing is not allowed for this content.";
            display: block !important;
            text-align: center;
            padding: 50px;
            font-size: 24px;
          }
        }
      `}</style>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push("/portal/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Eye className="w-4 h-4" />
                <span>Views: {assignment.view_count + 1}</span>
              </div>
              {!assignment.completed && (
                <button
                  onClick={handleMarkComplete}
                  disabled={markingComplete}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  {markingComplete ? "Marking..." : "Mark as Complete"}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content Protection Notice */}
      <div className="bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-yellow-800">
            <Shield className="w-4 h-4" />
            <span>
              This content is protected. Copying, printing, and downloading are
              disabled.
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Material Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getSubjectColor(material.subject)}`}
                >
                  {material.subject}
                </span>
                {material.week_number && (
                  <span className="text-sm text-gray-500">
                    Week {material.week_number}
                  </span>
                )}
                <span className="text-sm text-gray-500 capitalize">
                  {material.program_level} Level
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {material.title}
              </h1>
              {material.description && (
                <p className="text-gray-600">{material.description}</p>
              )}
            </div>
            {assignment.completed && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
          </div>

          {assignment.due_date && (
            <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t border-gray-100">
              <Clock className="w-4 h-4" />
              <span>
                Due:{" "}
                {new Date(assignment.due_date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Material Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {material.content_html ? (
            <div
              ref={contentRef}
              className="material-content"
              style={{
                fontSize: "16px",
                lineHeight: "1.8",
                fontFamily: "system-ui, -apple-system, sans-serif",
                color: "#1f2937",
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
                WebkitTouchCallout: "none",
              }}
              dangerouslySetInnerHTML={{ __html: material.content_html }}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              onMouseDown={(e) => {
                if (e.detail > 1) e.preventDefault();
              }}
            />
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Content is being prepared. Please check back later.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => router.push("/portal/dashboard")}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Return to Dashboard
          </button>

          {!assignment.completed && (
            <button
              onClick={handleMarkComplete}
              disabled={markingComplete}
              className="px-6 py-3 bg-gradient-to-r from-academy-primary to-academy-accent text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {markingComplete ? "Marking Complete..." : "Mark as Complete"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
