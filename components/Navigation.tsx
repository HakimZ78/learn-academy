"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, GraduationCap, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check initial auth state
    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      // Check if admin
      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setIsAdmin((profile as any)?.role === "admin");
    } else {
      setIsAdmin(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/programs", label: "Programs" },
    { href: "/classroom", label: "Virtual Classroom" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="font-display font-bold text-xl gradient-text">
              Learn Academy
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-academy-primary transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <Link
                    href={isAdmin ? "/portal/admin" : "/portal/dashboard"}
                    className="flex items-center gap-2 text-academy-primary hover:text-academy-secondary transition-colors font-medium"
                  >
                    <User className="w-4 h-4" />
                    {isAdmin ? "Admin Portal" : "Student Portal"}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/portal/login"
                    className="text-academy-primary hover:text-academy-secondary transition-colors font-medium border border-academy-primary hover:border-academy-secondary px-3 py-1.5 rounded-lg text-sm"
                  >
                    Student Login
                  </Link>
                  <Link href="/enrol" className="btn-primary text-sm">
                    Enrol Now
                  </Link>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-gray-700 hover:text-academy-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col space-y-2 mt-4">
              {user ? (
                <>
                  <Link
                    href={isAdmin ? "/portal/admin" : "/portal/dashboard"}
                    className="flex items-center justify-center gap-2 text-academy-primary hover:text-academy-secondary transition-colors font-medium border border-academy-primary hover:border-academy-secondary px-3 py-2 rounded-lg text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    {isAdmin ? "Admin Portal" : "Student Portal"}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium px-3 py-2 rounded-lg text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/portal/login"
                    className="text-academy-primary hover:text-academy-secondary transition-colors font-medium border border-academy-primary hover:border-academy-secondary px-3 py-2 rounded-lg text-sm text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Student Login
                  </Link>
                  <Link
                    href="/enrol"
                    className="btn-primary text-sm text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Enrol Now
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
