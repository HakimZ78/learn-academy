"use client";

import { ArrowRight, BookOpen, Users, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useData } from "@/contexts/DataContext";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Hero() {
  const { homepageData, isLoading } = useData();
  const [heroContent, setHeroContent] = useState(homepageData.hero);
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, -150]);
  const textY = useTransform(scrollY, [0, 300], [0, -50]);

  useEffect(() => {
    setHeroContent(homepageData.hero);
  }, [homepageData.hero]);

  // Listen for real-time updates
  useEffect(() => {
    const handleUpdate = (event: CustomEvent) => {
      setHeroContent(event.detail.hero);
    };

    window.addEventListener(
      "homepage-data-updated",
      handleUpdate as EventListener,
    );
    return () => {
      window.removeEventListener(
        "homepage-data-updated",
        handleUpdate as EventListener,
      );
    };
  }, []);

  if (isLoading) {
    return (
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden min-h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </section>
    );
  }
  return (
    <section className="relative pt-24 pb-16 overflow-hidden">
      {/* Animated gradient background */}
      <motion.div className="absolute inset-0 z-0" style={{ y: backgroundY }}>
        <div className="absolute inset-0 bg-gradient-to-br from-academy-primary via-academy-secondary to-academy-accent opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-white to-indigo-50 opacity-90"></div>
      </motion.div>

      {/* Sophisticated blur circles with focus transitions */}
      <motion.div
        className="absolute top-32 left-20 w-80 h-80 rounded-full opacity-40"
        style={{
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          filter: "blur(80px)",
        }}
        animate={{
          filter: ["blur(80px)", "blur(120px)", "blur(60px)", "blur(80px)"],
          opacity: [0.4, 0.2, 0.6, 0.4],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-32 right-16 w-96 h-96 rounded-full opacity-30"
        style={{
          background: "linear-gradient(45deg, #8b5cf6, #ec4899)",
          filter: "blur(100px)",
        }}
        animate={{
          filter: ["blur(100px)", "blur(60px)", "blur(140px)", "blur(100px)"],
          opacity: [0.3, 0.5, 0.1, 0.3],
          scale: [0.8, 0.5, 1.1, 0.8],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full opacity-25"
        style={{
          background: "linear-gradient(225deg, #06b6d4, #3b82f6)",
          filter: "blur(70px)",
        }}
        animate={{
          filter: ["blur(70px)", "blur(110px)", "blur(40px)", "blur(70px)"],
          opacity: [0.25, 0.4, 0.1, 0.25],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(0,0,0,.05) 35px, rgba(0,0,0,.05) 70px),
                          repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(0,0,0,.05) 35px, rgba(0,0,0,.05) 70px)`,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          style={{ y: textY }}
        >
          <motion.h1
            className="text-5xl md:text-6xl font-display font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="gradient-text">{heroContent.title}</span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-700 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            {heroContent.subtitle}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <Link
              href="/programs"
              className="btn-primary inline-flex items-center justify-center group"
            >
              {heroContent.primaryButton}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="btn-secondary inline-flex items-center justify-center"
            >
              {heroContent.secondaryButton}
            </Link>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 hover:bg-white/90 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <BookOpen className="h-12 w-12 text-academy-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                Interdisciplinary Approach
              </h3>
              <p className="text-gray-600">
                Connect subjects naturally, building real-world understanding
              </p>
            </motion.div>

            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 hover:bg-white/90 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Users className="h-12 w-12 text-academy-secondary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                1 to 1 Personalised Learning
              </h3>
              <p className="text-gray-600">
                Online or office based in Birmingham
              </p>
            </motion.div>

            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 hover:bg-white/90 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Lightbulb className="h-12 w-12 text-academy-accent mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                Future-Ready Skills
              </h3>
              <p className="text-gray-600">
                Prepare for tomorrow's challenges with adaptive learning
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
