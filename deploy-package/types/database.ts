export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "admin" | "student" | "parent";
          full_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: "admin" | "student" | "parent";
          full_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: "admin" | "student" | "parent";
          full_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          full_name: string;
          program_type: "foundation" | "elevate" | "gcse" | "a-level";
          date_of_birth: string | null;
          parent_email: string | null;
          parent_name: string | null;
          active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          full_name: string;
          program_type: "foundation" | "elevate" | "gcse" | "a-level";
          date_of_birth?: string | null;
          parent_email?: string | null;
          parent_name?: string | null;
          active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          email?: string;
          full_name?: string;
          program_type?: "foundation" | "elevate" | "gcse" | "a-level";
          date_of_birth?: string | null;
          parent_email?: string | null;
          parent_name?: string | null;
          active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      materials: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          week_number: number | null;
          subject:
            | "biology"
            | "chemistry"
            | "physics"
            | "mathematics"
            | "english";
          program_level: "foundation" | "elevate" | "gcse" | "a-level";
          file_path: string;
          file_type: string;
          content_html: string | null;
          tags: string[] | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          week_number?: number | null;
          subject:
            | "biology"
            | "chemistry"
            | "physics"
            | "mathematics"
            | "english";
          program_level: "foundation" | "elevate" | "gcse" | "a-level";
          file_path: string;
          file_type?: string;
          content_html?: string | null;
          tags?: string[] | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          week_number?: number | null;
          subject?:
            | "biology"
            | "chemistry"
            | "physics"
            | "mathematics"
            | "english";
          program_level?: "foundation" | "elevate" | "gcse" | "a-level";
          file_path?: string;
          file_type?: string;
          content_html?: string | null;
          tags?: string[] | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      student_assignments: {
        Row: {
          id: string;
          student_id: string;
          material_id: string;
          assigned_date: string;
          due_date: string | null;
          access_start: string;
          access_end: string | null;
          viewed: boolean;
          first_viewed_at: string | null;
          last_viewed_at: string | null;
          view_count: number;
          completed: boolean;
          completed_date: string | null;
          assigned_by: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          material_id: string;
          assigned_date?: string;
          due_date?: string | null;
          access_start?: string;
          access_end?: string | null;
          viewed?: boolean;
          first_viewed_at?: string | null;
          last_viewed_at?: string | null;
          view_count?: number;
          completed?: boolean;
          completed_date?: string | null;
          assigned_by?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string;
          material_id?: string;
          assigned_date?: string;
          due_date?: string | null;
          access_start?: string;
          access_end?: string | null;
          viewed?: boolean;
          first_viewed_at?: string | null;
          last_viewed_at?: string | null;
          view_count?: number;
          completed?: boolean;
          completed_date?: string | null;
          assigned_by?: string | null;
        };
      };
      access_logs: {
        Row: {
          id: string;
          student_id: string;
          material_id: string | null;
          action: "view" | "complete" | "print_attempt" | "copy_attempt";
          accessed_at: string;
          session_duration: number | null;
          ip_address: string | null;
          user_agent: string | null;
          browser: string | null;
          device_type: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          material_id?: string | null;
          action: "view" | "complete" | "print_attempt" | "copy_attempt";
          accessed_at?: string;
          session_duration?: number | null;
          ip_address?: string | null;
          user_agent?: string | null;
          browser?: string | null;
          device_type?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string;
          material_id?: string | null;
          action?: "view" | "complete" | "print_attempt" | "copy_attempt";
          accessed_at?: string;
          session_duration?: number | null;
          ip_address?: string | null;
          user_agent?: string | null;
          browser?: string | null;
          device_type?: string | null;
        };
      };
      admin_logs: {
        Row: {
          id: string;
          admin_id: string | null;
          action: string;
          target_type: string | null;
          target_id: string | null;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id?: string | null;
          action: string;
          target_type?: string | null;
          target_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string | null;
          action?: string;
          target_type?: string | null;
          target_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_student_dashboard: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          student_id: string;
          student_name: string;
          total_assignments: number;
          completed_assignments: number;
          pending_assignments: number;
          recent_materials: Json;
        }[];
      };
      track_material_view: {
        Args: {
          p_student_id: string;
          p_material_id: string;
          p_ip_address?: string;
          p_user_agent?: string;
        };
        Returns: void;
      };
    };
    Enums: {
      program_level: "foundation" | "elevate" | "gcse" | "a-level";
      subject_type:
        | "biology"
        | "chemistry"
        | "physics"
        | "mathematics"
        | "english";
      user_role: "admin" | "student" | "parent";
    };
  };
};

// Additional types for joined queries
export type StudentAssignmentWithDetails =
  Database["public"]["Tables"]["student_assignments"]["Row"] & {
    student: {
      full_name: string;
      email: string;
      program_type: string;
    } | null;
    material: {
      title: string;
      subject: string;
      week_number: number | null;
    } | null;
  };

export type MaterialWithAssignments =
  Database["public"]["Tables"]["materials"]["Row"] & {
    assignments?: Array<
      Database["public"]["Tables"]["student_assignments"]["Row"] & {
        student: {
          full_name: string;
          email: string;
        } | null;
      }
    >;
  };

export type ProfileWithRole = Database["public"]["Tables"]["profiles"]["Row"];
