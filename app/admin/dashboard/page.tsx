"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Edit3,
  FileText,
  Mail,
  Award,
  GraduationCap,
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

export default function AdminDashboard() {
  const { isAuthenticated, logout } = useAdmin();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin");
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const managementSections = [
    {
      title: "Content Management",
      items: [
        {
          name: "Homepage Content",
          href: "/admin/content/homepage",
          icon: Home,
          description: "Hero section, philosophy, testimonials",
        },
        {
          name: "Programs & Curriculum",
          href: "/admin/content/programs",
          icon: BookOpen,
          description: "Program details, pricing, curriculum",
        },
        {
          name: "About Page",
          href: "/admin/content/about",
          icon: Award,
          description: "Educator profile, qualifications, mission",
        },
        {
          name: "Contact Information",
          href: "/admin/content/contact",
          icon: Mail,
          description: "Contact details, location, FAQs",
        },
      ],
    },
    {
      title: "Student Management",
      items: [
        {
          name: "Enrollments",
          href: "/admin/enrollments",
          icon: Users,
          description: "View and manage student enrollments",
        },
        {
          name: "Messages & Inquiries",
          href: "/admin/messages",
          icon: MessageSquare,
          description: "Contact form submissions and inquiries",
        },
        {
          name: "Schedule",
          href: "/admin/schedule",
          icon: Calendar,
          description: "Class schedules and booking management",
        },
      ],
    },
    {
      title: "Site Management",
      items: [
        {
          name: "Site Settings",
          href: "/admin/settings",
          icon: Settings,
          description: "General site configuration",
        },
        {
          name: "Resources & Files",
          href: "/admin/resources",
          icon: FileText,
          description: "Upload and manage documents, images",
        },
      ],
    },
  ];

  const quickStats = [
    { label: "Total Students", value: "24", change: "+3 this month" },
    { label: "Programs Running", value: "3", change: "All active" },
    { label: "New Inquiries", value: "7", change: "This week" },
    { label: "Pending Enrollments", value: "2", change: "Awaiting review" },
  ];

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
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Learn Academy Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Home className="h-5 w-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-600">
            Manage your Learn Academy content and operations from here.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {stat.label}
              </h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-green-600">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Management Sections */}
        {managementSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {section.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={itemIndex}
                    href={item.href}
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 group"
                  >
                    <div className="flex items-start">
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                      </div>
                      <Edit3 className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Activity
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <p className="text-sm text-gray-600">
                  New inquiry from Sarah Johnson about Discovery Program
                </p>
                <span className="text-xs text-gray-400">2 hours ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <p className="text-sm text-gray-600">
                  Updated Foundation Program curriculum content
                </p>
                <span className="text-xs text-gray-400">1 day ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <p className="text-sm text-gray-600">
                  New enrollment: Michael Chen (Excellence Program)
                </p>
                <span className="text-xs text-gray-400">2 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
