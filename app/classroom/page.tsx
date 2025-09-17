"use client";

import { Video, ExternalLink, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function VirtualClassroom() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-academy-primary via-academy-secondary to-academy-accent pt-24 pb-16 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2070')`, // Teenage boy focused on laptop screen
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-academy-primary/80 via-academy-secondary/75 to-academy-accent/80"></div>
        </div>
      </div>

      {/* Animated Blur Circles */}
      <motion.div
        className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-20"
        style={{
          background: "linear-gradient(120deg, #1e40af, #7c3aed)",
          filter: "blur(90px)",
        }}
        animate={{
          filter: ["blur(90px)", "blur(50px)", "blur(130px)", "blur(90px)"],
          opacity: [0.2, 0.35, 0.1, 0.2],
          scale: [1, 0.8, 1.2, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-10 left-16 w-64 h-64 rounded-full opacity-15"
        style={{
          background: "linear-gradient(60deg, #7c3aed, #10b981)",
          filter: "blur(75px)",
        }}
        animate={{
          filter: ["blur(75px)", "blur(115px)", "blur(45px)", "blur(75px)"],
          opacity: [0.15, 0.3, 0.05, 0.15],
          scale: [1, 1.3, 0.7, 1],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-4xl md:text-5xl font-display font-bold mb-4 text-white drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="text-yellow-300">Virtual Classroom</span>
            </motion.h1>
            <motion.p
              className="text-xl text-white/90 max-w-2xl mx-auto mb-8 drop-shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Join your scheduled sessions
            </motion.p>

            {/* Info Box */}
            <motion.div
              className="bg-white/95 backdrop-blur-md border border-white/30 rounded-lg p-6 mb-12 max-w-2xl mx-auto shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <p className="text-gray-800 text-lg">
                📅 Session details and materials are provided via email before
                each session
              </p>
            </motion.div>
          </motion.div>

          {/* Meeting Platform Buttons */}
          <motion.div
            className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-8 mb-12 border border-white/30"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
            }}
          >
            <h2 className="text-2xl font-semibold text-center mb-8">
              Join Your Session
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Google Meet */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-blue-50 backdrop-blur-sm rounded-lg p-6 mb-4 shadow-lg border border-blue-100">
                  <Video className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Google Meet</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Click the link provided in your session email
                  </p>
                </div>
                <button
                  onClick={() =>
                    window.open("https://meet.google.com/", "_blank")
                  }
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Video className="h-4 w-4" />
                  Open Google Meet
                  <ExternalLink className="h-3 w-3" />
                </button>
              </motion.div>

              {/* Zoom */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-indigo-50 backdrop-blur-sm rounded-lg p-6 mb-4 shadow-lg border border-indigo-100">
                  <Video className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Zoom</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Use the meeting ID from your session email
                  </p>
                </div>
                <button
                  onClick={() => window.open("https://zoom.us/join", "_blank")}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Video className="h-4 w-4" />
                  Open Zoom
                  <ExternalLink className="h-3 w-3" />
                </button>
              </motion.div>
            </div>
          </motion.div>

          {/* Student Portal Notice */}
          <motion.div
            className="relative mb-12 overflow-hidden rounded-xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Background for this section */}
            <div className="absolute inset-0">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2073')`, // Student studying materials
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-academy-primary/90 to-academy-secondary/90"></div>
              </div>
            </div>

            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-white text-center shadow-2xl">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-white drop-shadow-lg" />
              <h2 className="text-2xl font-bold mb-4 drop-shadow-md">
                Need Your Session Materials?
              </h2>
              <p className="mb-6 text-white/90 drop-shadow-sm">
                Access your pre-session homework and materials through the
                student portal
              </p>
              <Link
                href="/portal/login"
                className="inline-block bg-white/90 backdrop-blur-sm text-academy-primary hover:bg-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Go to Student Portal
              </Link>
            </div>
          </motion.div>

          {/* Help Section */}
          <motion.div
            className="relative overflow-hidden rounded-xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Background for help section */}
            <div className="absolute inset-0">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070')`, // Support/help desk
                }}
              >
                <div className="absolute inset-0 bg-white/85"></div>
              </div>
            </div>

            <div className="relative text-center bg-white/90 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Need Technical Help?
              </h2>
              <p className="text-gray-600 mb-6">
                Having trouble joining your session? We're here to help.
              </p>
              <a
                href="https://wa.me/447779602503?text=Hello%2C%20I%20need%20help%20with%20joining%20my%20virtual%20classroom%20session"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary shadow-lg inline-block"
              >
                Contact Support via WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
